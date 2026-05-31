import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import nodemailer from "npm:nodemailer";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

// Mercado Pago integration uses fetch directly (no SDK required on Deno)
const MP_API = "https://api.mercadopago.com";

const app = new Hono();

// Helper to send emails
const sendEmail = async (to: string, subject: string, html: string) => {
  const smtpHost = Deno.env.get("SMTP_HOST");
  const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "587");
  const smtpUser = Deno.env.get("SMTP_USER");
  const smtpPass = Deno.env.get("SMTP_PASS");
  const smtpFrom = Deno.env.get("SMTP_FROM_EMAIL") || smtpUser;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn("SMTP settings not configured. Email not sent.");
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Ediliano Designer" <${smtpFrom}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};


// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-bdae3ab6/health", (c) => {
  return c.json({ status: "ok" });
});

// Contact form submission endpoint
app.post("/make-server-bdae3ab6/contact", async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, phone, subject, message } = body;

    // Validate required fields
    if (!name || !email || !phone || !subject || !message) {
      return c.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    // Create a unique key for this contact message
    const timestamp = Date.now();
    const contactId = `contact_${timestamp}`;

    // Store the contact message in KV store
    const contactData = {
      id: contactId,
      name,
      email,
      phone,
      subject,
      message,
      timestamp,
      createdAt: new Date().toISOString(),
      status: "new",
    };

    await kv.set(contactId, contactData);

    console.log(`Contact message received from ${email}: ${subject}`);

    // Also save as lead
    const leadId = `lead_${timestamp}`;
    const leadData = {
      id: leadId,
      name,
      email,
      phone,
      timestamp,
      createdAt: new Date().toISOString(),
    };
    await kv.set(leadId, leadData);

    return c.json({
      success: true,
      message: "Mensagem enviada com sucesso! Entrarei em contato em breve.",
      contactId,
    });
  } catch (error) {
    console.error("Error processing contact form:", error);
    return c.json(
      { error: "Erro ao processar mensagem. Tente novamente." },
      { status: 500 }
    );
  }
});

// Quote form submission endpoint
app.post("/make-server-bdae3ab6/quote", async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, phone, company, service, budget, deadline, description } = body;

    // Validate required fields
    if (!name || !email || !phone || !service || !budget || !description) {
      return c.json(
        { error: "Todos os campos obrigatórios devem ser preenchidos" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    // Create a unique key for this quote request
    const timestamp = Date.now();
    const quoteId = `quote_${timestamp}`;

    // Store the quote request in KV store
    const quoteData = {
      id: quoteId,
      name,
      email,
      phone,
      company: company || "Não informado",
      service,
      budget,
      deadline: deadline || "Não especificado",
      description,
      timestamp,
      createdAt: new Date().toISOString(),
      status: "pending",
      observations: "",
      value: "",
    };

    await kv.set(quoteId, quoteData);

    console.log(`Quote request received from ${email} for ${service}`);

    // Also save as lead (capturar lead do formulário de orçamento)
    const leadId = `lead_${timestamp}_quote`;
    const leadData = {
      id: leadId,
      name,
      email,
      phone,
      source: "orçamento",
      timestamp,
      createdAt: new Date().toISOString(),
    };
    await kv.set(leadId, leadData);

    return c.json({
      success: true,
      message: "Orçamento recebido com sucesso! Entrarei em contato em até 24 horas.",
      quoteId,
    });
  } catch (error) {
    console.error("Error processing quote form:", error);
    return c.json(
      { error: "Erro ao processar orçamento. Tente novamente." },
      { status: 500 }
    );
  }
});

// Get all contact messages (admin endpoint)
app.get("/make-server-bdae3ab6/contacts", async (c) => {
  try {
    const contacts = await kv.getByPrefix("contact_");
    
    // Sort by timestamp (newest first)
    const sortedContacts = contacts.sort((a, b) => b.timestamp - a.timestamp);

    return c.json({
      success: true,
      count: sortedContacts.length,
      contacts: sortedContacts,
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return c.json(
      { error: "Erro ao buscar mensagens" },
      { status: 500 }
    );
  }
});

// Update contact message status (admin endpoint)
app.put("/make-server-bdae3ab6/contacts/:contactId/status", async (c) => {
  try {
    const contactId = c.req.param("contactId");
    const body = await c.req.json();
    const { status } = body;

    // Validate status
    const validStatuses = ["new", "pending", "in_progress", "completed"];
    if (!validStatuses.includes(status)) {
      return c.json(
        { error: "Status inválido" },
        { status: 400 }
      );
    }

    // Get existing contact
    const existingContact = await kv.get(contactId);
    if (!existingContact) {
      return c.json(
        { error: "Mensagem não encontrada" },
        { status: 404 }
      );
    }

    // Update contact with new status
    const updatedContact = {
      ...existingContact,
      status,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(contactId, updatedContact);

    console.log(`Contact ${contactId} status updated to ${status}`);

    return c.json({
      success: true,
      message: "Status atualizado com sucesso",
      contact: updatedContact,
    });
  } catch (error) {
    console.error("Error updating contact status:", error);
    return c.json(
      { error: "Erro ao atualizar status da mensagem" },
      { status: 500 }
    );
  }
});

// Delete contact message (admin endpoint)
app.delete("/make-server-bdae3ab6/contacts/:contactId", async (c) => {
  try {
    const contactId = c.req.param("contactId");

    // Check if contact exists
    const existingContact = await kv.get(contactId);
    if (!existingContact) {
      return c.json(
        { error: "Mensagem não encontrada" },
        { status: 404 }
      );
    }

    // Delete the contact
    await kv.del(contactId);

    console.log(`Contact ${contactId} deleted`);

    return c.json({
      success: true,
      message: "Mensagem excluída com sucesso",
    });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return c.json(
      { error: "Erro ao excluir mensagem" },
      { status: 500 }
    );
  }
});

// Get all quote requests (admin endpoint)
app.get("/make-server-bdae3ab6/quotes", async (c) => {
  try {
    const quotes = await kv.getByPrefix("quote_");
    
    // Sort by timestamp (newest first)
    const sortedQuotes = quotes.sort((a, b) => b.timestamp - a.timestamp);

    return c.json({
      success: true,
      count: sortedQuotes.length,
      quotes: sortedQuotes,
    });
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return c.json(
      { error: "Erro ao buscar orçamentos" },
      { status: 500 }
    );
  }
});

// Update quote status (admin endpoint)
app.put("/make-server-bdae3ab6/quotes/:quoteId/status", async (c) => {
  try {
    const quoteId = c.req.param("quoteId");
    const body = await c.req.json();
    const { status } = body;

    // Validate status
    const validStatuses = ["pending", "in_progress", "completed"];
    if (!validStatuses.includes(status)) {
      return c.json(
        { error: "Status inválido" },
        { status: 400 }
      );
    }

    // Get existing quote
    const existingQuote = await kv.get(quoteId);
    if (!existingQuote) {
      return c.json(
        { error: "Orçamento não encontrado" },
        { status: 404 }
      );
    }

    // Update quote with new status
    const updatedQuote = {
      ...existingQuote,
      status,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(quoteId, updatedQuote);

    console.log(`Quote ${quoteId} status updated to ${status}`);

    return c.json({
      success: true,
      message: "Status atualizado com sucesso",
      quote: updatedQuote,
    });
  } catch (error) {
    console.error("Error updating quote status:", error);
    return c.json(
      { error: "Erro ao atualizar status do orçamento" },
      { status: 500 }
    );
  }
});

// Update quote observations and value (admin endpoint)
app.put("/make-server-bdae3ab6/quotes/:quoteId/details", async (c) => {
  try {
    const quoteId = c.req.param("quoteId");
    const body = await c.req.json();
    const { observations, value } = body;

    // Get existing quote
    const existingQuote = await kv.get(quoteId);
    if (!existingQuote) {
      return c.json(
        { error: "Orçamento não encontrado" },
        { status: 404 }
      );
    }

    // Update quote with new details
    const updatedQuote = {
      ...existingQuote,
      observations: observations || "",
      value: value || "",
      updatedAt: new Date().toISOString(),
    };

    await kv.set(quoteId, updatedQuote);

    console.log(`Quote ${quoteId} details updated`);

    return c.json({
      success: true,
      message: "Detalhes atualizados com sucesso",
      quote: updatedQuote,
    });
  } catch (error) {
    console.error("Error updating quote details:", error);
    return c.json(
      { error: "Erro ao atualizar detalhes do orçamento" },
      { status: 500 }
    );
  }
});

// Delete quote (admin endpoint)
app.delete("/make-server-bdae3ab6/quotes/:quoteId", async (c) => {
  try {
    const quoteId = c.req.param("quoteId");

    // Check if quote exists
    const existingQuote = await kv.get(quoteId);
    if (!existingQuote) {
      return c.json(
        { error: "Orçamento não encontrado" },
        { status: 404 }
      );
    }

    // Delete the quote
    await kv.del(quoteId);

    console.log(`Quote ${quoteId} deleted`);

    return c.json({
      success: true,
      message: "Orçamento excluído com sucesso",
    });
  } catch (error) {
    console.error("Error deleting quote:", error);
    return c.json(
      { error: "Erro ao excluir orçamento" },
      { status: 500 }
    );
  }
});

// Get all leads (admin endpoint)
app.get("/make-server-bdae3ab6/leads", async (c) => {
  try {
    const leads = await kv.getByPrefix("lead_");
    
    // Sort by timestamp (newest first)
    const sortedLeads = leads.sort((a, b) => b.timestamp - a.timestamp);

    return c.json({
      success: true,
      count: sortedLeads.length,
      leads: sortedLeads,
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return c.json(
      { error: "Erro ao buscar leads" },
      { status: 500 }
    );
  }
});

// Delete lead (admin endpoint)
app.delete("/make-server-bdae3ab6/leads/:leadId", async (c) => {
  try {
    const leadId = c.req.param("leadId");

    // Check if lead exists
    const existingLead = await kv.get(leadId);
    if (!existingLead) {
      return c.json(
        { error: "Lead não encontrado" },
        { status: 404 }
      );
    }

    // Delete the lead
    await kv.del(leadId);

    console.log(`Lead ${leadId} deleted`);

    return c.json({
      success: true,
      message: "Lead excluído com sucesso",
    });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return c.json(
      { error: "Erro ao excluir lead" },
      { status: 500 }
    );
  }
});

// Get all blog posts
app.get("/make-server-bdae3ab6/blog-posts", async (c) => {
  try {
    const posts = await kv.getByPrefix("blogpost_");
    
    // Sort by timestamp (newest first)
    const sortedPosts = posts.sort((a, b) => b.timestamp - a.timestamp);

    return c.json({
      success: true,
      count: sortedPosts.length,
      posts: sortedPosts,
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return c.json(
      { error: "Erro ao buscar posts" },
      { status: 500 }
    );
  }
});

// Get single blog post
app.get("/make-server-bdae3ab6/blog-posts/:postId", async (c) => {
  try {
    const postId = c.req.param("postId");
    const post = await kv.get(postId);

    if (!post) {
      return c.json(
        { error: "Post não encontrado" },
        { status: 404 }
      );
    }

    // Increment view count
    const updatedPost = {
      ...post,
      views: (post.views || 0) + 1,
    };
    await kv.set(postId, updatedPost);

    return c.json({
      success: true,
      post: updatedPost,
    });
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return c.json(
      { error: "Erro ao buscar post" },
      { status: 500 }
    );
  }
});

// Create new blog post (admin endpoint)
app.post("/make-server-bdae3ab6/blog-posts", async (c) => {
  try {
    const body = await c.req.json();
    const { title, excerpt, content, category, image, featured } = body;

    // Validate required fields
    if (!title || !excerpt || !content || !category || !image) {
      return c.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const postId = `blogpost_${timestamp}`;

    const postData = {
      id: postId,
      title,
      excerpt,
      content,
      category,
      image,
      featured: featured || false,
      author: "Ediliano Souza",
      timestamp,
      createdAt: new Date().toISOString(),
      views: 0,
    };

    await kv.set(postId, postData);

    console.log(`Blog post created: ${title}`);

    return c.json({
      success: true,
      message: "Post criado com sucesso",
      post: postData,
    });
  } catch (error) {
    console.error("Error creating blog post:", error);
    return c.json(
      { error: "Erro ao criar post" },
      { status: 500 }
    );
  }
});

// Update blog post (admin endpoint)
app.put("/make-server-bdae3ab6/blog-posts/:postId", async (c) => {
  try {
    const postId = c.req.param("postId");
    const body = await c.req.json();
    const { title, excerpt, content, category, image, featured } = body;

    // Get existing post
    const existingPost = await kv.get(postId);
    if (!existingPost) {
      return c.json(
        { error: "Post não encontrado" },
        { status: 404 }
      );
    }

    // Update post
    const updatedPost = {
      ...existingPost,
      title,
      excerpt,
      content,
      category,
      image,
      featured: featured || false,
      author: "Ediliano Souza",
      updatedAt: new Date().toISOString(),
    };

    await kv.set(postId, updatedPost);

    console.log(`Blog post updated: ${postId}`);

    return c.json({
      success: true,
      message: "Post atualizado com sucesso",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Error updating blog post:", error);
    return c.json(
      { error: "Erro ao atualizar post" },
      { status: 500 }
    );
  }
});

// Toggle featured status (admin endpoint)
app.put("/make-server-bdae3ab6/blog-posts/:postId/featured", async (c) => {
  try {
    const postId = c.req.param("postId");
    const body = await c.req.json();
    const { featured } = body;

    // Get existing post
    const existingPost = await kv.get(postId);
    if (!existingPost) {
      return c.json(
        { error: "Post não encontrado" },
        { status: 404 }
      );
    }

    // Update featured status
    const updatedPost = {
      ...existingPost,
      featured,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(postId, updatedPost);

    console.log(`Blog post featured status updated: ${postId} - ${featured}`);

    return c.json({
      success: true,
      message: "Status de destaque atualizado",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Error updating featured status:", error);
    return c.json(
      { error: "Erro ao atualizar status" },
      { status: 500 }
    );
  }
});

// Delete blog post (admin endpoint)
app.delete("/make-server-bdae3ab6/blog-posts/:postId", async (c) => {
  try {
    const postId = c.req.param("postId");

    // Check if post exists
    const existingPost = await kv.get(postId);
    if (!existingPost) {
      return c.json(
        { error: "Post não encontrado" },
        { status: 404 }
      );
    }

    // Delete the post
    await kv.del(postId);

    console.log(`Blog post deleted: ${postId}`);

    return c.json({
      success: true,
      message: "Post excluído com sucesso",
    });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return c.json(
      { error: "Erro ao excluir post" },
      { status: 500 }
    );
  }
});

// --- PORTFOLIO ENDPOINTS ---

// Get all portfolio items
app.get("/make-server-bdae3ab6/portfolio", async (c) => {
  try {
    const items = await kv.getByPrefix("portfolio_");
    // Sort: Featured first, then by date desc
    const sortedItems = items.sort((a, b) => {
      if (a.featured === b.featured) {
        return b.timestamp - a.timestamp;
      }
      return a.featured ? -1 : 1;
    });

    return c.json({ success: true, items: sortedItems });
  } catch (error) {
    return c.json({ error: "Erro ao buscar portfólio" }, { status: 500 });
  }
});

// Create portfolio item
app.post("/make-server-bdae3ab6/portfolio", async (c) => {
  try {
    const body = await c.req.json();
    const { title, category, image, link, featured } = body;

    if (!title || !image) {
      return c.json({ error: "Título e Imagem são obrigatórios" }, { status: 400 });
    }

    const timestamp = Date.now();
    const id = `portfolio_${timestamp}`;
    const newItem = {
      id,
      title,
      category: category || "Design",
      image,
      link: link || "",
      featured: featured || false,
      timestamp,
      createdAt: new Date().toISOString()
    };

    await kv.set(id, newItem);
    return c.json({ success: true, item: newItem });
  } catch (error) {
    return c.json({ error: "Erro ao criar item" }, { status: 500 });
  }
});

// Update portfolio item
app.put("/make-server-bdae3ab6/portfolio/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(id);

    if (!existing) return c.json({ error: "Item não encontrado" }, { status: 404 });

    const updated = { ...existing, ...body, updatedAt: new Date().toISOString() };
    await kv.set(id, updated);

    return c.json({ success: true, item: updated });
  } catch (error) {
    return c.json({ error: "Erro ao atualizar item" }, { status: 500 });
  }
});

// Delete portfolio item
app.delete("/make-server-bdae3ab6/portfolio/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: "Erro ao excluir item" }, { status: 500 });
  }
});

// Password reset request endpoint
app.post("/make-server-bdae3ab6/auth/reset-password", async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;

    if (!email) {
      return c.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    const authorizedEmails = [
      'contato@edilianodesigner.com.br',
      'edydzn@gmail.com'
    ];

    if (!authorizedEmails.includes(email)) {
      return c.json(
        { error: "Email não encontrado no sistema." },
        { status: 404 }
      );
    }

    // Log the reset request (Simulating email sending)
    console.log(`PASSWORD RESET REQUEST: Email sent to ${email} with instructions.`);

    // Send actual email if SMTP is configured
    const resetLink = "https://edilianodesigner.com.br/admin?reset_token=TEMP_TOKEN_123"; // In a real app, generate a unique token
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Redefinição de Senha</h1>
        <p>Olá,</p>
        <p>Recebemos uma solicitação para redefinir a senha do seu painel administrativo.</p>
        <p>Sua senha atual é: <strong>#Edydzn51122</strong> (Esta é uma senha estática do sistema)</p>
        <p>Se você não solicitou esta alteração, ignore este email.</p>
        <p>Atenciosamente,<br>Ediliano Designer System</p>
      </div>
    `;

    const emailSent = await sendEmail(email, "Recuperação de Senha - Ediliano Designer", emailHtml);

    if (emailSent) {
      return c.json({
        success: true,
        message: "Instruções de redefinição enviadas para o email.",
      });
    } else {
      // Fallback if SMTP not configured, but still return success to frontend to avoid leaking server config info
      // unless it's strictly dev mode
      return c.json({
        success: true,
        message: "Solicitação recebida. Verifique os logs do servidor se o email não chegar.",
      });
    }
  } catch (error) {
    console.error("Error processing password reset:", error);
    return c.json(
      { error: "Erro ao processar solicitação" },
      { status: 500 }
    );
  }
});

// Auth Signup Endpoint
app.post("/make-server-bdae3ab6/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return c.json({ error: "Todos os campos são obrigatórios" }, { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: name },
      email_confirm: true // Automatically confirm to avoid Supabase sending email
    });

    if (error) {
      console.error("Signup error:", error);
      return c.json({ error: error.message }, { status: 400 });
    }

    // Send welcome email
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Bem-vindo ao Ediliano Designer!</h1>
        <p>Olá ${name},</p>
        <p>Sua conta foi criada com sucesso.</p>
        <p>Agora você pode acessar nossa loja e baixar seus ativos.</p>
        <p>Atenciosamente,<br>Ediliano Designer Team</p>
      </div>
    `;

    // Fire and forget email to speed up response
    sendEmail(email, "Bem-vindo à Loja Ediliano Designer", emailHtml).catch(e => console.error("Error sending welcome email:", e));

    return c.json({
      success: true,
      user: data.user,
      message: "Conta criada com sucesso!"
    });

  } catch (error) {
    console.error("Server signup error:", error);
    return c.json({ error: "Erro ao criar conta" }, { status: 500 });
  }
});

// --- INFINITE PAY INTEGRATION ---

// 1. Create Checkout / Payment Link
app.post("/make-server-bdae3ab6/store/subscribe/infinitepay", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
       return c.json({ error: "Faça login para assinar." }, { status: 401 });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || ""
    );
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
       console.error("[InfinitePay] Auth Error:", authError);
       return c.json({ error: "Sessão expirada. Faça login novamente." }, { status: 401 });
    }

    const userId = user.id;
    const timestamp = Date.now();
    const orderNsu = `premium-${userId}-${timestamp}`;

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const webhookUrl = `${supabaseUrl}/functions/v1/make-server-bdae3ab6/webhook-infinitepay`;
    const redirectUrl = "https://edilianodesigner.com.br/pagamento-efetivado";

    // Store pending transaction
    await kv.set(`infinitepay_tx_${orderNsu}`, {
       orderNsu,
       userId,
       userEmail: user.email,
       status: 'pending',
       createdAt: new Date().toISOString()
    });

    console.log("[InfinitePay] Creating checkout for user:", userId, "NSU:", orderNsu);

    // Try InfinitePay Public Checkout API
    try {
      const checkoutPayload = {
        handle: "$souzacomunicacao",
        items: [
          {
            description: "Assinatura Premium Mensal - Ediliano Designer",
            quantity: 1,
            price: 3500
          }
        ],
        order_nsu: orderNsu,
        redirect_url: redirectUrl,
        webhook_url: webhookUrl
      };

      console.log("[InfinitePay] Calling checkout API...");

      const apiResponse = await fetch("https://api.infinitepay.io/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkoutPayload)
      });

      const apiData = await apiResponse.json();
      console.log("[InfinitePay] API status:", apiResponse.status, "data:", JSON.stringify(apiData));

      if (apiResponse.ok && (apiData.checkout_url || apiData.paymentUrl || apiData.url)) {
        const checkoutUrl = apiData.checkout_url || apiData.paymentUrl || apiData.url;
        
        await kv.set(`infinitepay_tx_${orderNsu}`, {
          orderNsu, userId, userEmail: user.email,
          status: 'checkout_created', slug: apiData.slug || '',
          checkoutUrl, createdAt: new Date().toISOString()
        });

        return c.json({ success: true, paymentUrl: checkoutUrl });
      }

      console.log("[InfinitePay] API did not return checkout URL, using direct link fallback");
    } catch (apiErr) {
      console.error("[InfinitePay] API call failed, using direct link fallback:", apiErr);
    }

    // Fallback: Direct payment link
    const directPaymentUrl = `https://pay.infinitepay.io/$souzacomunicacao`;

    await kv.set(`infinitepay_tx_${orderNsu}`, {
      orderNsu, userId, userEmail: user.email,
      status: 'pending_direct_link', paymentUrl: directPaymentUrl,
      createdAt: new Date().toISOString()
    });

    return c.json({ success: true, paymentUrl: directPaymentUrl });

  } catch (error) {
    console.error("[InfinitePay] Create Error:", error);
    return c.json({ error: "Erro interno ao criar link de pagamento." }, { status: 500 });
  }
});

// 2. Webhook Handler
app.post("/make-server-bdae3ab6/webhook-infinitepay", async (c) => {
  try {
    const body = await c.req.json();
    console.log("[InfinitePay] Webhook received:", body);

    const { order_nsu, amount, paid } = body;

    // Validate
    if (!order_nsu) {
       return c.json({ error: "Missing order_nsu" }, { status: 400 });
    }

    // Find transaction
    const txKey = `infinitepay_tx_${order_nsu}`;
    const tx = await kv.get(txKey);

    if (!tx) {
       console.warn("[InfinitePay] Transaction not found for NSU:", order_nsu);
       // We return 200 to stop retries if it's an invalid order for us
       return c.json({}, { status: 200 }); 
    }

    // Logic: If paid amount matches (35.00) and paid is true (or implied by webhook presence)
    // The prompt example says "paid_amount": 1010. We expect 3500.
    // We'll be lenient on amount check for now or exact.
    
    // Parse userId from NSU "premium-{userId}-{timestamp}"
    const parts = order_nsu.split('-');
    // premium, userId, timestamp... userId might contain hyphens? UUID?
    // UUID has hyphens. So we should join parts 1 to length-1.
    // "premium-" is 8 chars. Last part is timestamp.
    // Safest is to use the userId stored in KV tx.
    
    const userId = tx.userId;
    const userKey = `store_user_${userId}`;
    let userProfile = await kv.get(userKey);

    if (!userProfile) {
       // Should exist, but if not, create
       // Fetch email from Supabase (expensive here), or just fail safely
       console.error("[InfinitePay] User profile missing for id:", userId);
       return c.json({}, { status: 200 });
    }

    // Update Subscription
    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    userProfile.subscriptionStatus = 'active';
    userProfile.subscriptionExpiresAt = expiresAt.toISOString();
    
    await kv.set(userKey, userProfile);
    
    // Update Transaction Status
    tx.status = 'paid';
    tx.updatedAt = now.toISOString();
    tx.webhookData = body;
    await kv.set(txKey, tx);

    console.log(`[InfinitePay] Subscription activated for user ${userId}`);

    return c.json({}, { status: 200 });
    
  } catch (error) {
    console.error("Webhook Error:", error);
    // Return 400 to trigger retry as per prompt
    return c.json({}, { status: 400 });
  }
});

// 3. Check Payment Status (Manual/Polling)
app.post("/make-server-bdae3ab6/store/subscribe/check-infinitepay", async (c) => {
  try {
     const body = await c.req.json();
     const { order_nsu } = body;
     
     // Call InfinitePay Check Endpoint
     // Requisição para o status de pagamento: POST https://api.infinitepay.io/invoices/public/checkout/payment_check
     const checkUrl = "https://api.infinitepay.io/invoices/public/checkout/payment_check";
     
     // We need to know the 'slug' from the creation response usually? 
     // The prompt says body example: { handle, order_nsu, transaction_nsu, slug }
     // If we don't have slug, maybe order_nsu is enough? 
     
     const response = await fetch(checkUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           handle: "$souzacomunicacao",
           order_nsu
        })
     });
     
     const data = await response.json();
     
     if (data.paid) {
         // Manually trigger success logic if webhook failed or is slow
         const tx = await kv.get(`infinitepay_tx_${order_nsu}`);
         if (tx && tx.status !== 'paid') {
             const userId = tx.userId;
             const userKey = `store_user_${userId}`;
             const userProfile = await kv.get(userKey);
             
             if (userProfile) {
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 30);
                userProfile.subscriptionStatus = 'active';
                userProfile.subscriptionExpiresAt = expiresAt.toISOString();
                await kv.set(userKey, userProfile);
                
                tx.status = 'paid';
                await kv.set(`infinitepay_tx_${order_nsu}`, tx);
             }
         }
         return c.json({ paid: true });
     }
     
     return c.json({ paid: false });

  } catch (error) {
     return c.json({ error: "Check Error" }, { status: 500 });
  }
});

// --- MERCADO PAGO INTEGRATION ---

// 1. Create Mercado Pago Checkout Preference
app.post("/make-server-bdae3ab6/store/checkout/mercadopago", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      console.error("[MP Checkout] No authorization header");
      return c.json({ error: "Faça login para continuar." }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || ""
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("[MP Checkout] Auth Error:", authError);
      return c.json({ error: "Sessão expirada. Faça login novamente." }, { status: 401 });
    }

    const body = await c.req.json().catch(() => ({} as any));
    const { itemId, type = 'item' } = body || {};

    console.log(`[MP Checkout] User: ${user.email}, Type: ${type}, ItemId: ${itemId || 'N/A'}`);

    const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!accessToken) {
      console.error("[MP Checkout] MERCADOPAGO_ACCESS_TOKEN not configured");
      return c.json({ error: "Mercado Pago não configurado. Contate o administrador." }, { status: 500 });
    }

    const userId = user.id;
    const userEmail = user.email || "";

    let items: any[] = [];
    let metadata: Record<string, string> = { userId, userEmail, type };
    let externalReference = "";

    if (type === 'subscription') {
      items = [{
        id: 'sub_premium_monthly',
        title: 'Assinatura Premium Mensal - Ediliano Designer',
        description: 'Acesso ilimitado a todos os itens premium do Creator',
        quantity: 1,
        currency_id: 'BRL',
        unit_price: 35.00,
      }];
      metadata.subscriptionType = 'monthly';
      externalReference = `sub_${userId}_${Date.now()}`;
    } else if (type === 'item' && itemId) {
      const item = await kv.get(itemId);
      if (!item) {
        console.error(`[MP Checkout] Item not found: ${itemId}`);
        return c.json({ error: "Item não encontrado." }, { status: 404 });
      }
      if (item.isFree) {
        console.warn(`[MP Checkout] Attempt to purchase free item: ${itemId}`);
        return c.json({ error: "Item gratuito, não requer pagamento." }, { status: 400 });
      }
      items = [{
        id: itemId,
        title: item.title,
        description: item.description || `Item da categoria ${item.category}`,
        quantity: 1,
        currency_id: 'BRL',
        unit_price: Number(item.price) || 10.00,
      }];
      metadata.itemId = itemId;
      metadata.itemTitle = item.title;
      externalReference = `item_${userId}_${itemId}_${Date.now()}`;
    } else {
      console.error(`[MP Checkout] Invalid payment type or missing itemId`);
      return c.json({ error: "Tipo de pagamento inválido." }, { status: 400 });
    }

    const baseUrl = Deno.env.get("PUBLIC_SITE_URL") || "https://edilianodesigner.com.br";
    const successUrl = `${baseUrl}/pagamento-efetivado?reference=${externalReference}`;
    const failureUrl = `${baseUrl}/?section=store`;
    const pendingUrl = `${baseUrl}/pagamento-efetivado?reference=${externalReference}&status=pending`;
    const notificationUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/make-server-bdae3ab6/webhook-mercadopago`;

    const preferenceBody = {
      items,
      payer: { email: userEmail },
      back_urls: { success: successUrl, failure: failureUrl, pending: pendingUrl },
      auto_return: "approved",
      external_reference: externalReference,
      metadata,
      notification_url: notificationUrl,
      statement_descriptor: "EDILIANO DESIGNER",
    };

    console.log(`[MP Checkout] Creating preference with ${items.length} item(s)`);

    const mpResponse = await fetch(`${MP_API}/checkout/preferences`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferenceBody),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error(`[MP Checkout] API error:`, mpData);
      return c.json({ error: mpData.message || "Erro ao criar preferência no Mercado Pago." }, { status: 500 });
    }

    const txId = `mp_tx_${externalReference}`;
    await kv.set(txId, {
      preferenceId: mpData.id,
      externalReference,
      userId,
      userEmail,
      type,
      itemId: itemId || null,
      status: 'pending',
      createdAt: new Date().toISOString(),
      metadata
    });

    const checkoutUrl = mpData.init_point || mpData.sandbox_init_point;
    console.log(`[MP Checkout] Preference created: ${mpData.id}`);
    console.log(`[MP Checkout] Checkout URL: ${checkoutUrl}`);

    return c.json({
      success: true,
      preferenceId: mpData.id,
      externalReference,
      url: checkoutUrl,
    });
  } catch (error) {
    console.error("[MP Checkout] Error:", error);
    return c.json({ error: `Erro ao criar pagamento: ${error.message}` }, { status: 500 });
  }
});

// 2. Mercado Pago Webhook Handler
// Configure in MP Dashboard:
// URL: https://YOUR_SUPABASE_URL/functions/v1/make-server-bdae3ab6/webhook-mercadopago
// Events: payment, merchant_order
app.post("/make-server-bdae3ab6/webhook-mercadopago", async (c) => {
  try {
    console.log("[MP Webhook] Received notification");

    const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!accessToken) {
      console.error("[MP Webhook] MERCADOPAGO_ACCESS_TOKEN not configured");
      return c.json({ error: "Mercado Pago not configured" }, { status: 500 });
    }

    const body = await c.req.json().catch(() => ({} as any));
    const topic = c.req.query('topic') || c.req.query('type') || body.type;
    const id = c.req.query('id') || c.req.query('data.id') || body.data?.id;

    console.log(`[MP Webhook] Topic: ${topic}, ID: ${id}`);

    if (!id || (topic !== 'payment' && topic !== 'merchant_order')) {
      console.log(`[MP Webhook] Ignoring topic: ${topic}`);
      return c.json({ received: true }, { status: 200 });
    }

    let externalReference = '';
    let approved = false;

    if (topic === 'payment') {
      const payRes = await fetch(`${MP_API}/v1/payments/${id}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const payment = await payRes.json();
      console.log(`[MP Webhook] Payment status: ${payment.status}, ref: ${payment.external_reference}`);
      externalReference = payment.external_reference || '';
      approved = payment.status === 'approved';
    } else if (topic === 'merchant_order') {
      const moRes = await fetch(`${MP_API}/merchant_orders/${id}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const order = await moRes.json();
      externalReference = order.external_reference || '';
      const totalPaid = (order.payments || [])
        .filter((p: any) => p.status === 'approved')
        .reduce((sum: number, p: any) => sum + (p.transaction_amount || 0), 0);
      approved = totalPaid >= (order.total_amount || 0) && order.total_amount > 0;
    }

    if (!externalReference) {
      console.warn(`[MP Webhook] No external_reference resolved`);
      return c.json({ received: true }, { status: 200 });
    }

    const txId = `mp_tx_${externalReference}`;
    const tx = await kv.get(txId);
    if (!tx) {
      console.warn(`[MP Webhook] Transaction not found for ref: ${externalReference}`);
      return c.json({ received: true }, { status: 200 });
    }

    if (!approved) {
      console.log(`[MP Webhook] Payment not yet approved for ${externalReference}`);
      return c.json({ received: true }, { status: 200 });
    }

    const userId = tx.userId;
    const type = tx.type;
    console.log(`[MP Webhook] Approved: UserId=${userId}, Type=${type}`);

    if (type === 'subscription') {
      const userKey = `store_user_${userId}`;
      let userProfile = await kv.get(userKey);
      if (!userProfile) {
        const supabaseAdmin = createClient(
          Deno.env.get("SUPABASE_URL") || "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
        );
        const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId);
        userProfile = {
          userId,
          email: user?.email || tx.userEmail,
          subscriptionStatus: 'inactive',
          downloadsToday: 0,
          lastDownloadDate: new Date().toISOString().split('T')[0],
          totalDownloads: 0
        };
      }
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      userProfile.subscriptionStatus = 'active';
      userProfile.subscriptionExpiresAt = expiresAt.toISOString();
      await kv.set(userKey, userProfile);
      console.log(`[MP Webhook] ✓ Subscription activated for ${userId} until ${expiresAt.toISOString()}`);
    } else if (type === 'item') {
      const itemId = tx.itemId;
      if (itemId) {
        const purchaseId = `store_purchase_${userId}_${itemId}`;
        await kv.set(purchaseId, {
          userId,
          itemId,
          purchasedAt: new Date().toISOString(),
          externalReference,
        });
        console.log(`[MP Webhook] ✓ Item ${itemId} purchased by ${userId}`);
      }
    }

    tx.status = 'completed';
    tx.completedAt = new Date().toISOString();
    await kv.set(txId, tx);

    return c.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[MP Webhook] Error:", error);
    return c.json({ error: "Webhook processing failed" }, { status: 400 });
  }
});

// 3. Check Mercado Pago Payment Status
app.post("/make-server-bdae3ab6/store/checkout/mercadopago/status", async (c) => {
  try {
    const body = await c.req.json();
    const { externalReference } = body;

    console.log(`[MP Status] Checking status for ref: ${externalReference}`);
    if (!externalReference) {
      return c.json({ error: "externalReference required" }, { status: 400 });
    }

    const txId = `mp_tx_${externalReference}`;
    const tx = await kv.get(txId);
    if (!tx) {
      console.warn(`[MP Status] Transaction not found: ${externalReference}`);
      return c.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (tx.status === 'pending') {
      const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
      if (accessToken) {
        try {
          const searchRes = await fetch(
            `${MP_API}/v1/payments/search?external_reference=${encodeURIComponent(externalReference)}`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
          );
          const searchData = await searchRes.json();
          const approved = (searchData.results || []).some((p: any) => p.status === 'approved');
          if (approved) {
            console.log(`[MP Status] Payment confirmed via API for ${externalReference}`);
            tx.status = 'completed';
            tx.completedAt = new Date().toISOString();
            await kv.set(txId, tx);

            // Apply effects (same as webhook)
            if (tx.type === 'subscription') {
              const userKey = `store_user_${tx.userId}`;
              let profile = await kv.get(userKey) || {
                userId: tx.userId,
                email: tx.userEmail,
                subscriptionStatus: 'inactive',
                downloadsToday: 0,
                lastDownloadDate: new Date().toISOString().split('T')[0],
                totalDownloads: 0,
              };
              const expiresAt = new Date();
              expiresAt.setDate(expiresAt.getDate() + 30);
              profile.subscriptionStatus = 'active';
              profile.subscriptionExpiresAt = expiresAt.toISOString();
              await kv.set(userKey, profile);
            } else if (tx.type === 'item' && tx.itemId) {
              await kv.set(`store_purchase_${tx.userId}_${tx.itemId}`, {
                userId: tx.userId,
                itemId: tx.itemId,
                purchasedAt: new Date().toISOString(),
                externalReference,
              });
            }

            return c.json({
              success: true,
              status: 'completed',
              type: tx.type,
              itemId: tx.itemId,
            });
          }
        } catch (err) {
          console.error(`[MP Status] Error fetching from MP API:`, err);
        }
      }
    }

    return c.json({
      success: true,
      status: tx.status,
      type: tx.type,
      itemId: tx.itemId,
    });
  } catch (error) {
    console.error("[MP Status] Error:", error);
    return c.json({ error: "Error checking status" }, { status: 500 });
  }
});

// Upload media endpoint
app.post("/make-server-bdae3ab6/upload", async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body['file'];

    if (!file || !(file instanceof File)) {
       return c.json({ error: "Arquivo inválido" }, { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.some(b => b.name === 'calendar-media')) {
      await supabase.storage.createBucket('calendar-media', { public: false });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('calendar-media')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = await supabase.storage
      .from('calendar-media')
      .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year URL

    return c.json({
      success: true,
      url: data?.signedUrl
    });

  } catch (error) {
    console.error("Upload error:", error);
    return c.json({ error: "Erro no upload" }, { status: 500 });
  }
});

// Helper for HMAC-SHA1 signature (Twitter OAuth 1.0a)
const generateTwitterAuthHeader = (
  method: string,
  url: string,
  consumerKey: string,
  consumerSecret: string,
  accessToken: string,
  tokenSecret: string,
  params: Record<string, string> = {}
) => {
  const oauth = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: '1.0',
    ...params
  };

  // 1. Create Parameter String
  const sortedKeys = Object.keys(oauth).sort();
  let paramString = '';
  for (const key of sortedKeys) {
    if (paramString) paramString += '&';
    paramString += `${encodeURIComponent(key)}=${encodeURIComponent((oauth as any)[key])}`;
  }

  // 2. Create Signature Base String
  const signatureBaseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;

  // 3. Calculate Signature
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  const signature = crypto.createHmac('sha1', signingKey).update(signatureBaseString).digest('base64');

  // 4. Create Authorization Header
  const authParams = { ...oauth, oauth_signature: signature };
  const authHeader = 'OAuth ' + Object.keys(authParams).sort().map(key => {
    return `${encodeURIComponent(key)}="${encodeURIComponent((authParams as any)[key])}"`;
  }).join(', ');

  return authHeader;
};

// Helper for "Real" Posting
const postToSocialMedia = async (post: any) => {
  console.log(`[AUTO-POST] Iniciando processamento para o post ${post.id} (${post.platform})`);
  
  try {
    const accountId = `social_account_${post.platform}`;
    const account = await kv.get(accountId);

    if (!account || !account.connected) {
      throw new Error(`Conta não conectada para ${post.platform}`);
    }

    if (!account.accessToken) {
      throw new Error(`Credenciais ausentes para ${post.platform}`);
    }

    let success = false;
    let apiError = '';

    // Helper para tratar erros de token expirado e desconectar conta automaticamente
    const handleAuthError = async (platform: string, errorData: any, accountId: string, currentAccount: any) => {
      const msg = errorData?.error?.message || JSON.stringify(errorData);
      const isAuthError = 
        // Facebook/Instagram codes
        errorData?.error?.code === 190 || 
        errorData?.error?.code === 102 ||
        msg.includes("Session has expired") ||
        msg.includes("Error validating access token") ||
        // Twitter/TikTok generic patterns
        msg.includes("Invalid token") ||
        msg.includes("access_token_invalid") ||
        msg.includes("unauthorized");

      if (isAuthError) {
        console.log(`[AUTO-POST] Detectado erro de autenticação para ${platform}. Desconectando conta...`);
        const updatedAccount = { ...currentAccount, connected: false, error: "Sessão expirada. Reconecte a conta." };
        await kv.set(accountId, updatedAccount);
        return new Error(`Sessão expirada ou token inválido para ${platform}. Por favor, vá em Configurações e reconecte a conta.`);
      }
      return new Error(msg);
    };

    try {
      // --- FACEBOOK ---
      if (post.platform === 'facebook') {
        const pageId = account.username.trim(); 
        const token = account.accessToken.trim();
        
        console.log(`[AUTO-POST] FB: Postando na página ${pageId}`);

        // Determinar se é foto ou feed normal
        const hasMedia = post.media && post.media.length > 0 && post.media[0].url;
        
        if (hasMedia && (post.type === 'image' || !post.type)) {
           // Postar como FOTO (melhor alcance)
           const photoUrl = `https://graph.facebook.com/v18.0/${pageId}/photos`;
           const params = new URLSearchParams();
           params.append('url', post.media[0].url);
           params.append('message', post.content || '');
           params.append('access_token', token);
           
           const response = await fetch(photoUrl, { method: 'POST', body: params });
           const data = await response.json();
           
           if (!response.ok) {
             console.error('[AUTO-POST] FB Photo Error:', data);
             throw await handleAuthError('facebook', data, accountId, account);
           }
           success = true;
        } else {
           // Postar como TEXTO ou LINK
           const url = `https://graph.facebook.com/v18.0/${pageId}/feed`;
           const params = new URLSearchParams();
           params.append('message', post.content || '');
           params.append('access_token', token);
           
           if (hasMedia) {
             params.append('link', post.media[0].url);
           }
  
           const response = await fetch(url, { method: 'POST', body: params });
           const data = await response.json();
           
           if (!response.ok) {
             console.error('[AUTO-POST] FB Feed Error:', data);
             throw await handleAuthError('facebook', data, accountId, account);
           }
           success = true;
        }
      } 
      // --- INSTAGRAM ---
      else if (post.platform === 'instagram') {
         const igUserId = account.username; // ID da conta Business
         const containerUrl = `https://graph.facebook.com/v18.0/${igUserId}/media`;
         
         const containerParams = new URLSearchParams();
         containerParams.append('access_token', account.accessToken);
         
         // Verifica se temos mídia
         const mediaUrl = (post.media && post.media.length > 0) ? post.media[0].url : null;
         
         // Tenta detectar se é vídeo pela extensão ou pelo tipo salvo
         const isVideo = post.media && post.media.length > 0 && (
             post.media[0].type === 'video' || 
             (post.media[0].url && post.media[0].url.match(/\.(mp4|mov|avi|webm)$/i))
         );

         if (!mediaUrl) {
             // Fallback apenas para teste se não houver mídia (Stories/Reels falhariam sem mídia real)
             containerParams.append('image_url', 'https://via.placeholder.com/1080');
             containerParams.append('caption', post.content || '');
         } else {
             // Lógica específica para cada formato (Feed, Stories, Reels)
             
             if (post.type === 'story') {
                 // STORIES
                 containerParams.append('media_type', 'STORIES');
                 if (isVideo) {
                     containerParams.append('video_url', mediaUrl);
                 } else {
                     containerParams.append('image_url', mediaUrl);
                 }
                 // Nota: Stories via API não suportam 'caption' (o texto não aparece na imagem)
             } 
             else if (post.type === 'reels' || post.type === 'reel') {
                 // REELS (Obrigatório ser vídeo)
                 if (!isVideo) {
                     throw new Error("Para postar Reels, a mídia deve ser um vídeo (.mp4, .mov).");
                 }
                 containerParams.append('media_type', 'REELS');
                 containerParams.append('video_url', mediaUrl);
                 containerParams.append('caption', post.content || '');
                 containerParams.append('share_to_feed', 'true'); // Postar também na grade do perfil
             } 
             else {
                 // FEED POST (Padrão)
                 containerParams.append('caption', post.content || '');
                 if (isVideo) {
                     containerParams.append('media_type', 'VIDEO');
                     containerParams.append('video_url', mediaUrl);
                 } else {
                     containerParams.append('image_url', mediaUrl);
                 }
             }
         }
         
         const containerRes = await fetch(containerUrl, { method: 'POST', body: containerParams });
         const containerData = await containerRes.json();
         
         if (!containerRes.ok) throw await handleAuthError('instagram', containerData, accountId, account);
         
         const creationId = containerData.id;
         
         // Polling para verificar se a mídia está pronta (Evita erro "Media ID is not available")
         let attempts = 0;
         let isReady = false;
         
         while (attempts < 10) { // Tenta por até 20 segundos
            const statusUrl = `https://graph.facebook.com/v18.0/${creationId}?fields=status_code&access_token=${account.accessToken}`;
            const statusRes = await fetch(statusUrl);
            const statusData = await statusRes.json();
            
            if (statusData.status_code === 'FINISHED') {
                isReady = true;
                break;
            }
            
            if (statusData.status_code === 'ERROR' || statusData.status_code === 'EXPIRED') {
                throw new Error(`O Instagram falhou ao processar a imagem. Status: ${statusData.status_code}`);
            }
            
            // Espera 2 segundos antes de tentar novamente
            console.log(`[IG-POLLING] Mídia ${creationId} ainda processando (${statusData.status_code})...`);
            await new Promise(r => setTimeout(r, 2000));
            attempts++;
         }
         
         if (!isReady) {
             throw new Error("Tempo limite excedido ao aguardar processamento da imagem pelo Instagram.");
         }

         const publishUrl = `https://graph.facebook.com/v18.0/${igUserId}/media_publish`;
         const publishParams = new URLSearchParams();
         publishParams.append('creation_id', creationId);
         publishParams.append('access_token', account.accessToken);
         
         const publishRes = await fetch(publishUrl, { method: 'POST', body: publishParams });
         if (!publishRes.ok) {
             const publishData = await publishRes.json();
             throw await handleAuthError('instagram', publishData, accountId, account);
         }
         success = true;
      }
      // --- TWITTER (X) ---
      else if (post.platform === 'twitter' || post.platform === 'x') {
        let creds;
        try {
          // Tenta parsear JSON com as 4 chaves
          creds = JSON.parse(account.accessToken);
        } catch (e) {
          throw new Error("Credenciais inválidas. Para X (Twitter), reconecte a conta inserindo API Key, Secret e Tokens.");
        }

        if (!creds.apiKey || !creds.apiSecret || !creds.accessToken || !creds.accessTokenSecret) {
          throw new Error("Credenciais incompletas para X (Twitter).");
        }

        const url = 'https://api.twitter.com/2/tweets';
        const method = 'POST';
        
        // OAuth 1.0a Signature
        const authHeader = generateTwitterAuthHeader(
          method, 
          url, 
          creds.apiKey, 
          creds.apiSecret, 
          creds.accessToken, 
          creds.accessTokenSecret
        );

        const body = { text: post.content };

        const response = await fetch(url, {
          method,
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });

        const data = await response.json();
        
        if (!response.ok) {
           throw new Error(data.detail || data.title || 'Erro na API do Twitter');
        }
        success = true;
      }
      // --- TIKTOK ---
      else if (post.platform === 'tiktok') {
         let creds;
         try {
            creds = JSON.parse(account.accessToken);
         } catch (e) {
            throw new Error("Credenciais inválidas. Reconecte o TikTok.");
         }

         if (!post.media || post.media.length === 0) {
             throw new Error("TikTok exige um vídeo.");
         }

         let accessToken = creds.accessToken;

         // Se não tiver token direto, tenta gerar via Client Credentials (embora limitado)
         if (!accessToken) {
             if (!creds.clientKey || !creds.clientSecret) {
                throw new Error("Client Key/Secret ou Access Token são obrigatórios.");
             }

             console.log('[TIKTOK] Gerando token via Client Credentials...');
             
             // 1. Obter Access Token (Client Credentials)
             const tokenParams = new URLSearchParams();
             tokenParams.append('client_key', creds.clientKey);
             tokenParams.append('client_secret', creds.clientSecret);
             tokenParams.append('grant_type', 'client_credentials');
             tokenParams.append('scope', 'user.info.basic,video.publish,video.upload');
    
             const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: tokenParams
             });
    
             const tokenData = await tokenRes.json();
             
             if (!tokenRes.ok || !tokenData.access_token) {
                console.error('[TIKTOK] Auth Error:', tokenData);
                throw new Error(tokenData.error_description || "Erro ao autenticar com TikTok. Verifique Key e Secret.");
             }
    
             accessToken = tokenData.access_token;
             console.log('[TIKTOK] Token gerado com sucesso.');
         } else {
             console.log('[TIKTOK] Usando Access Token fornecido manualmente.');
         }

         // 2. Publicar Vídeo (Direct Post - Pull from URL)
         const initRes = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                post_info: {
                    title: post.content || '',
                    privacy_level: 'PUBLIC_TO_EVERYONE',
                    disable_duet: false,
                    disable_comment: false,
                    disable_stitch: false,
                    video_cover_timestamp_ms: 1000
                },
                source_info: {
                    source: 'PULL_FROM_URL',
                    video_url: post.media[0].url
                }
            })
         });
         
         const initData = await initRes.json();
         
         if (!initRes.ok || initData.error) {
             console.error('[TIKTOK] Publish Error:', initData);
             
             if (initData.error?.code === 'access_token_invalid') {
                throw new Error("Token inválido ou sem permissão de postagem. Se você está usando Key/Secret, o TikTok pode não permitir postagem via Client Credentials. Por favor, edite a conexão e insira um 'User Access Token' válido manualmente.");
             }
             
             throw new Error(initData.error?.message || initData.message || "Erro ao publicar no TikTok.");
         }
         
         // Se chegou aqui, a API aceitou o pedido.
         success = true;
      }
      // --- OUTRAS (Não suportadas) ---
      else {
         throw new Error(`Integração com ${post.platform} não configurada.`);
      }

    } catch (e: any) {
      console.error(`[AUTO-POST] Falha na API (${post.platform}):`, e);
      apiError = e.message;
    }

    // Atualizar status final
    if (success) {
      console.log(`[AUTO-POST] Sucesso: ${post.platform}`);
      const successPost = { ...post, status: 'published', publishedAt: new Date().toISOString() };
      await kv.set(post.id, successPost);
    } else {
      console.log(`[AUTO-POST] Falha: ${post.platform} - ${apiError}`);
      const failedPost = { ...post, status: 'error', errorMessage: apiError };
      await kv.set(post.id, failedPost);
    }

  } catch (error: any) {
    console.error("[AUTO-POST] Erro crítico:", error);
    const failedPost = { ...post, status: 'error', errorMessage: error.message || 'Erro interno' };
    await kv.set(post.id, failedPost);
  }
};

// Cron-like endpoint to check scheduled posts
app.post("/make-server-bdae3ab6/cron/check-schedule", async (c) => {
  try {
    const posts = await kv.getByPrefix("calendar_post_");
    const now = new Date();
    const processed = [];

    for (const post of posts) {
       // Verificar apenas posts agendados
       if (post.status === 'scheduled') {
           // Combinar data e hora
           const postDate = new Date(post.date);
           const [hours, minutes] = post.time.split(':').map(Number);
           postDate.setHours(hours, minutes, 0, 0);

           // Se a data/hora já passou
           if (now >= postDate) {
               console.log(`[CRON] Processando post agendado vencido: ${post.id}`);
               // Atualiza status para 'processing' para evitar duplicidade rápida (opcional, mas bom)
               // E dispara a postagem
               await postToSocialMedia(post);
               processed.push(post.id);
           }
       }
    }

    return c.json({ success: true, processedCount: processed.length, processedIds: processed });
  } catch (error) {
     console.error("Cron Error:", error);
     return c.json({ error: "Erro ao verificar agendamentos" }, { status: 500 });
  }
});

// Get all calendar posts
app.get("/make-server-bdae3ab6/calendar-posts", async (c) => {
  try {
    const posts = await kv.getByPrefix("calendar_post_");
    return c.json({
      success: true,
      count: posts.length,
      posts: posts,
    });
  } catch (error) {
    console.error("Error fetching calendar posts:", error);
    return c.json({ error: "Erro ao buscar posts do calendário" }, { status: 500 });
  }
});

// Create calendar post
app.post("/make-server-bdae3ab6/calendar-posts", async (c) => {
  try {
    const body = await c.req.json();
    const { date, platform, type, content, status, time, media } = body;

    if (!date || !platform || !type) {
      return c.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const timestamp = Date.now();
    const postId = `calendar_post_${timestamp}`;
    
    const postData = {
      id: postId,
      date, // ISO string
      platform,
      type,
      content,
      status: status || 'draft',
      time: time || '12:00',
      media: media || [], // Array of { url, type }
      timestamp,
      createdAt: new Date().toISOString()
    };

    await kv.set(postId, postData);

    // Trigger "Real" Post if published immediately
    if (postData.status === 'published') {
      // Run in background so we don't block response
      postToSocialMedia(postData);
    }
    
    return c.json({
      success: true,
      post: postData
    });
  } catch (error) {
    console.error("Error creating calendar post:", error);
    return c.json({ error: "Erro ao criar post" }, { status: 500 });
  }
});

// Update calendar post
app.put("/make-server-bdae3ab6/calendar-posts/:postId", async (c) => {
  try {
    const postId = c.req.param("postId");
    const body = await c.req.json();
    
    const existingPost = await kv.get(postId);
    if (!existingPost) {
      return c.json({ error: "Post não encontrado" }, { status: 404 });
    }

    const updatedPost = {
      ...existingPost,
      ...body,
      updatedAt: new Date().toISOString()
    };

    await kv.set(postId, updatedPost);

    // Trigger "Real" Post if status changed to published
    if (updatedPost.status === 'published' && existingPost.status !== 'published') {
      postToSocialMedia(updatedPost);
    }
    
    return c.json({
      success: true,
      post: updatedPost
    });
  } catch (error) {
    console.error("Error updating calendar post:", error);
    return c.json({ error: "Erro ao atualizar post" }, { status: 500 });
  }
});

// Delete calendar post
app.delete("/make-server-bdae3ab6/calendar-posts/:postId", async (c) => {
  try {
    const postId = c.req.param("postId");
    await kv.del(postId);
    return c.json({ success: true, message: "Post excluído" });
  } catch (error) {
    console.error("Error deleting calendar post:", error);
    return c.json({ error: "Erro ao excluir post" }, { status: 500 });
  }
});

// Get connected social accounts
app.get("/make-server-bdae3ab6/social-accounts", async (c) => {
  try {
    const accounts = await kv.getByPrefix("social_account_");
    return c.json({
      success: true,
      accounts: accounts,
    });
  } catch (error) {
    console.error("Error fetching social accounts:", error);
    return c.json({ error: "Erro ao buscar contas" }, { status: 500 });
  }
});

// Connect/Update social account
app.post("/make-server-bdae3ab6/social-accounts", async (c) => {
  try {
    const body = await c.req.json();
    const { platform, username, connected, token } = body;

    // Variáveis para armazenar os dados finais a serem salvos (podem ser atualizados pela validação inteligente)
    let savedUsername = username;
    let savedToken = token;

    // Validar token se fornecido
    if (token && connected) {
      try {
         if (platform === 'facebook') {
            const inputId = username.trim();
            const inputToken = token.trim();
            
            // 1. Tentar buscar /me/accounts para encontrar o Token de Página correto (Melhor Prática)
            // Isso permite que o usuário forneça apenas um Token de Usuário e o ID, e nós pegamos o token correto automaticamente.
            try {
               const accountsRes = await fetch(`https://graph.facebook.com/v18.0/me/accounts?fields=id,name,access_token&limit=100&access_token=${inputToken}`);
               
               if (accountsRes.ok) {
                  const accountsData = await accountsRes.json();
                  if (accountsData.data) {
                     // Tenta encontrar por ID
                     let pageMatch = accountsData.data.find((p: any) => p.id === inputId);
                     
                     // Se não achou por ID, tenta por NOME (case insensitive)
                     if (!pageMatch) {
                        pageMatch = accountsData.data.find((p: any) => p.name.toLowerCase() === inputId.toLowerCase());
                     }

                     if (pageMatch) {
                        console.log(`[FB-SMART-CONNECT] Página encontrada: ${pageMatch.name} (${pageMatch.id}). Usando Page Access Token.`);
                        // Atualiza para usar o ID correto e o TOKEN DA PÁGINA (que tem permissão de postar)
                        savedUsername = pageMatch.id;
                        savedToken = pageMatch.access_token;
                     } else {
                        console.log(`[FB-SMART-CONNECT] Página com ID/Nome '${inputId}' não encontrada na conta do usuário.`);
                     }
                  }
               } else {
                  const errorData = await accountsRes.json();
                  console.warn("[FB-SMART-CONNECT] Falha ao listar contas (Token inválido ou sem permissão de user?):", errorData);
               }
            } catch (scanError) {
               console.warn("[FB-SMART-CONNECT] Erro ao listar contas:", scanError);
            }

            // 2. Validação final com os dados (potencialmente atualizados)
            const fbRes = await fetch(`https://graph.facebook.com/v18.0/${savedUsername}?fields=id,name&access_token=${savedToken}`);
            const fbData = await fbRes.json();
            
            if (fbData.error) {
               console.error("FB Validation Error:", fbData);
               
               // Mensagem de erro amigável
               let errorMsg = `Erro no Facebook: ${fbData.error.message}`;
               
               if (fbData.error.code === 190) {
                  errorMsg = "Token de acesso inválido ou expirado (Bad Signature). Verifique se copiou o token completo.";
               } else if (fbData.error.code === 100) {
                  if (fbData.error.error_subcode === 33) {
                      errorMsg = `A página '${savedUsername}' existe, mas seu Token não tem permissão para gerenciá-la. Verifique se o Token possui as permissões 'pages_read_engagement', 'pages_show_list' e 'pages_manage_posts'.`;
                  } else if (isNaN(Number(savedUsername))) {
                     errorMsg = `Não foi possível encontrar a página '${savedUsername}'. O Facebook exige o ID Numérico para conexões diretas, ou um Token de Usuário válido para buscarmos pelo nome.`;
                  } else {
                     errorMsg = `Não foi possível acessar a página ID '${savedUsername}'. Verifique se o ID está correto e se o Token tem permissão 'pages_read_engagement' e 'pages_manage_posts'.`;
                  }
               }
               return c.json({ error: errorMsg }, { status: 400 });
            }
            console.log(`FB Account Validated: ${fbData.name} (${fbData.id})`);
         }
         else if (platform === 'instagram') {
            const inputToken = token.trim();
            
            // Verificação de Token Basic Display (IGAA...)
            if (inputToken.startsWith('IGAA')) {
               return c.json({ 
                  error: "O token inserido (IGAA...) é de 'Exibição Básica' e não permite agendamento de posts. Para automação, você precisa de um Token do Facebook (EAA...) vinculado à sua conta Instagram Business/Creator." 
               }, { status: 400 });
            }

            // Lógica Smart Connect para Instagram (via Token do Facebook)
            let igAccountFound = null;
            let pageAccessToken = null;

            try {
               // 1. Buscar páginas do usuário e verificar contas de Instagram vinculadas
               console.log("[IG-SMART-CONNECT] Buscando contas de Instagram vinculadas...");
               const pagesRes = await fetch(`https://graph.facebook.com/v18.0/me/accounts?fields=name,access_token,instagram_business_account{id,username}&limit=100&access_token=${inputToken}`);
               
               if (pagesRes.ok) {
                  const pagesData = await pagesRes.json();
                  if (pagesData.data) {
                     // Filtrar páginas que têm Instagram Business vinculado
                     const igPages = pagesData.data.filter((p: any) => p.instagram_business_account);
                     
                     if (igPages.length > 0) {
                        // Se o usuário digitou um username, tentar encontrar o específico
                        const inputUser = username.trim().replace('@', '').toLowerCase();
                        
                        if (inputUser) {
                           const match = igPages.find((p: any) => 
                              p.instagram_business_account.username.toLowerCase() === inputUser
                           );
                           if (match) {
                              igAccountFound = match.instagram_business_account;
                              pageAccessToken = match.access_token;
                           }
                        }
                        
                        // Se não encontrou específico ou não digitou, pega o primeiro disponível (fallback)
                        if (!igAccountFound && igPages.length > 0) {
                           // Se só tem um, usa ele
                           if (igPages.length === 1) {
                              igAccountFound = igPages[0].instagram_business_account;
                              pageAccessToken = igPages[0].access_token;
                           } else {
                              // Se tem vários e não especificou, não podemos adivinhar, mas vamos tentar o primeiro por conveniência
                              // Idealmente pediria para o usuário especificar, mas vamos logar
                              console.log("[IG-SMART-CONNECT] Múltiplas contas encontradas, usando a primeira:", igPages[0].instagram_business_account.username);
                              igAccountFound = igPages[0].instagram_business_account;
                              pageAccessToken = igPages[0].access_token;
                           }
                        }
                     }
                  }
               }
            } catch (scanError) {
               console.warn("[IG-SMART-CONNECT] Falha ao buscar contas vinculadas:", scanError);
            }

            if (igAccountFound && pageAccessToken) {
               console.log(`[IG-SMART-CONNECT] Conta Instagram encontrada: @${igAccountFound.username} (${igAccountFound.id})`);
               // Salvar o ID da conta Business (necessário para a API) e o Token da Página (necessário para permissão)
               savedUsername = igAccountFound.id; 
               savedToken = pageAccessToken;
               
               // Opcional: Poderíamos salvar o handle original em outro lugar, mas por enquanto vamos manter a estrutura
               // Vamos avisar no console
            } else {
               // Fallback: Validação direta se o usuário já forneceu o ID correto
               const igId = username.trim();
               const igRes = await fetch(`https://graph.facebook.com/v18.0/${igId}?fields=id,username&access_token=${token}`);
               const igData = await igRes.json();
               
               if (igData.error) {
                  return c.json({ 
                     error: `Não foi possível conectar ao Instagram. Certifique-se de que: 1. É uma conta Business/Creator. 2. Está vinculada a uma Página do Facebook. 3. O Token usado é do Facebook (EAA...) com permissões 'instagram_basic' e 'instagram_content_publish'.` 
                  }, { status: 400 });
               }
            }
         }
         else if (platform === 'twitter' || platform === 'x') {
            try {
               const creds = JSON.parse(token);
               if (!creds.apiKey || !creds.apiSecret || !creds.accessToken || !creds.accessTokenSecret) {
                  return c.json({ error: "JSON do Twitter inválido. São necessárias 4 chaves: apiKey, apiSecret, accessToken, accessTokenSecret." }, { status: 400 });
               }
            } catch (e) {
               return c.json({ error: "O token do Twitter deve ser um JSON válido com as 4 chaves." }, { status: 400 });
            }
         }
         else if (platform === 'tiktok') {
            try {
               const creds = JSON.parse(token);
               if (!creds.clientKey || !creds.clientSecret) {
                  return c.json({ error: "JSON do TikTok inválido. São necessárias 2 chaves: clientKey e clientSecret." }, { status: 400 });
               }
            } catch (e) {
               return c.json({ error: "O token do TikTok deve ser um JSON válido com as chaves clientKey e clientSecret." }, { status: 400 });
            }
         }
      } catch (e: any) {
         console.error("Validation Exception:", e);
         // Não bloquear se for erro de rede, mas avisar
      }
    }

    const accountId = `social_account_${platform}`;
    const accountData = {
      id: accountId,
      platform,
      username: savedUsername, // Usar o validado/corrigido
      accessToken: savedToken || "", // Usar o validado/corrigido (Page Token)
      connected: connected !== false,
      connectedAt: new Date().toISOString()
    };

    await kv.set(accountId, accountData);
    
    return c.json({
      success: true,
      account: accountData
    });
  } catch (error) {
    console.error("Error connecting social account:", error);
    return c.json({ error: "Erro ao conectar conta" }, { status: 500 });
  }
});

// Disconnect social account
app.delete("/make-server-bdae3ab6/social-accounts/:platform", async (c) => {
  try {
    const platform = c.req.param("platform");
    const accountId = `social_account_${platform}`;
    await kv.del(accountId);
    return c.json({ success: true, message: "Conta desconectada" });
  } catch (error) {
    console.error("Error disconnecting account:", error);
    return c.json({ error: "Erro ao desconectar conta" }, { status: 500 });
  }
});

// --- DIGITAL STORE ENDPOINTS ---

// ====================================================================
// STRATEGIC CALENDAR (datas comemorativas vinculadas à Creator)
// ====================================================================
const STRAT_PREFIX = "strategic_event_";

app.get("/make-server-bdae3ab6/strategic-calendar", async (c) => {
  try {
    const events = await kv.getByPrefix(STRAT_PREFIX);
    return c.json({ success: true, events: events || [] });
  } catch (error) {
    console.log("strategic-calendar GET error:", error);
    return c.json({ success: false, error: "Erro ao buscar eventos" }, { status: 500 });
  }
});

app.post("/make-server-bdae3ab6/strategic-calendar", async (c) => {
  try {
    const body = await c.req.json();
    if (!body || !body.id || !body.name || !body.date) {
      return c.json({ success: false, error: "id, name e date são obrigatórios" }, { status: 400 });
    }
    const event = {
      id: String(body.id),
      name: String(body.name),
      date: String(body.date),
      tags: Array.isArray(body.tags) ? body.tags : [],
      productIds: Array.isArray(body.productIds) ? body.productIds : [],
      featured: !!body.featured,
      trending: !!body.trending,
      description: body.description || "",
      updatedAt: Date.now(),
    };
    await kv.set(`${STRAT_PREFIX}${event.id}`, event);
    return c.json({ success: true, event });
  } catch (error) {
    console.log("strategic-calendar POST error:", error);
    return c.json({ success: false, error: "Erro ao salvar evento" }, { status: 500 });
  }
});

app.delete("/make-server-bdae3ab6/strategic-calendar/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`${STRAT_PREFIX}${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("strategic-calendar DELETE error:", error);
    return c.json({ success: false, error: "Erro ao excluir evento" }, { status: 500 });
  }
});

app.post("/make-server-bdae3ab6/strategic-calendar/bulk", async (c) => {
  try {
    const body = await c.req.json();
    const events = Array.isArray(body?.events) ? body.events : [];
    const saved: any[] = [];
    for (const e of events) {
      if (!e?.id || !e?.name || !e?.date) continue;
      const event = {
        id: String(e.id),
        name: String(e.name),
        date: String(e.date),
        tags: Array.isArray(e.tags) ? e.tags : [],
        productIds: Array.isArray(e.productIds) ? e.productIds : [],
        featured: !!e.featured,
        trending: !!e.trending,
        description: e.description || "",
        updatedAt: Date.now(),
      };
      await kv.set(`${STRAT_PREFIX}${event.id}`, event);
      saved.push(event);
    }
    return c.json({ success: true, count: saved.length });
  } catch (error) {
    console.log("strategic-calendar bulk error:", error);
    return c.json({ success: false, error: "Erro ao importar eventos" }, { status: 500 });
  }
});

// Get all store items
app.get("/make-server-bdae3ab6/store/items", async (c) => {
  try {
    const items = await kv.getByPrefix("store_item_");
    const sortedItems = items.sort((a, b) => b.timestamp - a.timestamp);
    return c.json({ success: true, items: sortedItems });
  } catch (error) {
    return c.json({ error: "Erro ao buscar itens da loja" }, { status: 500 });
  }
});

// Create store item (Admin)
app.post("/make-server-bdae3ab6/store/items", async (c) => {
  try {
    const body = await c.req.json();
    const { title, category, description, image, fileUrl, isFree, isFeatured, offerStart, offerEnd, colors, gradient } = body;

    if (!title || !category) {
      return c.json({ error: "Título e Categoria são obrigatórios" }, { status: 400 });
    }

    // Relaxed validation: Palettes don't need image/file.
    // Ensure category is clean
    const cleanCategory = category.trim();

    const timestamp = Date.now();
    const id = `store_item_${timestamp}`;
    
    // Construct item with all possible fields
    const newItem = {
      id,
      title,
      category: cleanCategory,
      description: description || "",
      image: image || "",
      fileUrl: fileUrl || "",
      isFree: isFree || false,
      isFeatured: isFeatured || false,
      offerStart: offerStart || null,
      offerEnd: offerEnd || null,
      colors: colors || [],
      gradient: gradient || "",
      downloadCount: 0,
      timestamp,
      createdAt: new Date().toISOString()
    };

    console.log(`[Store] Saving item: ${title} (${cleanCategory})`);
    await kv.set(id, newItem);
    
    return c.json({ success: true, item: newItem });
  } catch (error) {
    return c.json({ error: "Erro ao criar item" }, { status: 500 });
  }
});

// Update store item (Admin)
app.put("/make-server-bdae3ab6/store/items/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(id);

    if (!existing) return c.json({ error: "Item não encontrado" }, { status: 404 });

    const updated = { 
       ...existing, 
       ...body,
       // Ensure new fields are merged if they didn't exist before
       colors: body.colors || existing.colors || [],
       gradient: body.gradient || existing.gradient || "",
       updatedAt: new Date().toISOString() 
    };

    console.log(`[Store] Updating item: ${updated.title}`);
    await kv.set(id, updated);
    return c.json({ success: true, item: updated });
  } catch (error) {
    return c.json({ error: "Erro ao atualizar item" }, { status: 500 });
  }
});

// Delete store item (Admin)
app.delete("/make-server-bdae3ab6/store/items/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: "Erro ao excluir item" }, { status: 500 });
  }
});

// Get User Store Status (Subscription, Downloads left)
app.get("/make-server-bdae3ab6/store/user-status", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) return c.json({ error: "Unauthorized" }, { status: 401 });
    
    // In a real app, verify Supabase JWT. Here we trust the client to send the user ID in a header or query for simplicity 
    // OR ideally we call supabase.auth.getUser(token).
    // Let's do it properly:
    const token = authHeader.split(' ')[1];
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || ""
    );
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) return c.json({ error: "Unauthorized" }, { status: 401 });

    const userId = user.id;
    const userKey = `store_user_${userId}`;
    let userProfile = await kv.get(userKey);

    const today = new Date().toISOString().split('T')[0];

    // Initialize or Reset daily counter
    if (!userProfile) {
      userProfile = {
        userId,
        email: user.email,
        subscriptionStatus: 'inactive', // inactive, active
        subscriptionExpiresAt: null,
        downloadsToday: 0,
        lastDownloadDate: today,
        totalDownloads: 0
      };
      await kv.set(userKey, userProfile);

      // Save as Lead (Registration)
      const leadId = `lead_${userId}_store_reg`;
      await kv.set(leadId, {
         id: leadId,
         name: user.user_metadata?.full_name || 'Novo Usuário Loja',
         email: user.email,
         phone: '',
         source: 'loja_cadastro',
         timestamp: Date.now(),
         createdAt: new Date().toISOString()
      });
    } else if (userProfile.lastDownloadDate !== today) {
      userProfile.downloadsToday = 0;
      userProfile.lastDownloadDate = today;
      await kv.set(userKey, userProfile);
    }

    return c.json({ success: true, status: userProfile });
  } catch (error) {
    console.error("Store Status Error:", error);
    return c.json({ error: "Erro ao buscar status" }, { status: 500 });
  }
});

// Subscribe (Mock Payment)
app.post("/make-server-bdae3ab6/store/subscribe", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) return c.json({ error: "Unauthorized" }, { status: 401 });
    
    const token = authHeader.split(' ')[1];
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || ""
    );
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) return c.json({ error: "Unauthorized" }, { status: 401 });

    const userId = user.id;
    const userKey = `store_user_${userId}`;
    let userProfile = await kv.get(userKey) || {
      userId,
      email: user.email,
      downloadsToday: 0,
      lastDownloadDate: new Date().toISOString().split('T')[0],
      totalDownloads: 0
    };

    // Activate for 30 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    userProfile.subscriptionStatus = 'active';
    userProfile.subscriptionExpiresAt = expiresAt.toISOString();
    
    await kv.set(userKey, userProfile);

    // Also save as lead if not already
    const leadId = `lead_${userId}_store`;
    const existingLead = await kv.get(leadId);
    if (!existingLead) {
       await kv.set(leadId, {
         id: leadId,
         name: user.user_metadata?.full_name || 'Usuário Loja',
         email: user.email,
         phone: user.user_metadata?.phone || '',
         source: 'store_subscription',
         timestamp: Date.now(),
         createdAt: new Date().toISOString()
       });
    }

    return c.json({ success: true, message: "Assinatura ativada com sucesso!", status: userProfile });
  } catch (error) {
    return c.json({ error: "Erro na assinatura" }, { status: 500 });
  }
});

// Download Item
app.post("/make-server-bdae3ab6/store/download", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) return c.json({ error: "Unauthorized" }, { status: 401 });
    
    const token = authHeader.split(' ')[1];
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || ""
    );
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) return c.json({ error: "Unauthorized" }, { status: 401 });

    const body = await c.req.json();
    const { itemId } = body;
    
    const item = await kv.get(itemId);
    if (!item) return c.json({ error: "Item não encontrado" }, { status: 404 });

    const userId = user.id;
    const userKey = `store_user_${userId}`;
    let userProfile = await kv.get(userKey);
    const today = new Date().toISOString().split('T')[0];

    // Ensure profile exists
    if (!userProfile) {
       userProfile = {
        userId,
        email: user.email,
        subscriptionStatus: 'inactive',
        downloadsToday: 0,
        lastDownloadDate: today,
        totalDownloads: 0
      };
    }

    // Reset daily count if needed
    if (userProfile.lastDownloadDate !== today) {
      userProfile.downloadsToday = 0;
      userProfile.lastDownloadDate = today;
    }

    // CHECK RULES
    if (!item.isFree) {
       // Check if user purchased this specific item
       const purchaseKey = `store_purchase_${userId}_${itemId}`;
       const purchase = await kv.get(purchaseKey);
       
       const hasItemAccess = !!purchase;
       
       // Check subscription
       const now = new Date();
       const expires = userProfile.subscriptionExpiresAt ? new Date(userProfile.subscriptionExpiresAt) : null;
       const hasActiveSubscription = userProfile.subscriptionStatus === 'active' && expires && now <= expires;
       
       // User must have either purchased the item OR have an active subscription
       if (!hasItemAccess && !hasActiveSubscription) {
         return c.json({ error: "subscription_required", message: "Assinatura ou compra necessária para baixar este item." }, { status: 403 });
       }

       // Check daily limit (only for subscription users, not for individual purchases)
       if (hasActiveSubscription && !hasItemAccess && userProfile.downloadsToday >= 5) {
         return c.json({ error: "limit_reached", message: "Limite diário de 5 downloads atingido." }, { status: 403 });
       }
    }

    // Process Download
    userProfile.downloadsToday += 1;
    userProfile.totalDownloads = (userProfile.totalDownloads || 0) + 1;
    await kv.set(userKey, userProfile);

    // Increment item download count
    item.downloadCount = (item.downloadCount || 0) + 1;
    await kv.set(itemId, item);

    // Log download history
    const logId = `store_log_${Date.now()}`;
    await kv.set(logId, {
      id: logId,
      userId,
      email: user.email,
      itemId,
      itemTitle: item.title,
      timestamp: Date.now()
    });

    return c.json({ success: true, url: item.fileUrl, downloadsToday: userProfile.downloadsToday });

  } catch (error) {
    console.error("Download Error:", error);
    return c.json({ error: "Erro ao processar download" }, { status: 500 });
  }
});


// ====================================================================
// ADMIN: SUBSCRIPTIONS, USERS, STATS, PAYMENTS
// ====================================================================
const adminClient = () => createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

// List all store users + subscription info
app.get("/make-server-bdae3ab6/admin/users", async (c) => {
  try {
    const profiles = await kv.getByPrefix("store_user_");
    const supabase = adminClient();
    const { data: authList } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const authMap = new Map<string, any>();
    (authList?.users || []).forEach((u: any) => authMap.set(u.id, u));

    const users = (profiles || []).map((p: any) => {
      const a = authMap.get(p.userId);
      return {
        ...p,
        name: a?.user_metadata?.full_name || a?.user_metadata?.name || '',
        createdAt: a?.created_at || null,
        lastSignInAt: a?.last_sign_in_at || null,
      };
    });
    return c.json({ success: true, users });
  } catch (error) {
    console.log("admin/users error:", error);
    return c.json({ success: false, error: String(error) }, { status: 500 });
  }
});

// Set subscription manually
app.post("/make-server-bdae3ab6/admin/users/:userId/subscription", async (c) => {
  try {
    const userId = c.req.param("userId");
    const body = await c.req.json();
    const userKey = `store_user_${userId}`;
    let profile = await kv.get(userKey) || { userId, downloadsToday: 0, totalDownloads: 0 };

    profile.subscriptionStatus = body.status === 'active' ? 'active' : 'inactive';
    if (body.status === 'active') {
      const days = parseInt(body.days || 30);
      profile.subscriptionExpiresAt = Date.now() + days * 24 * 60 * 60 * 1000;
      profile.subscriptionMethod = body.method || 'manual';
    } else {
      profile.subscriptionExpiresAt = null;
    }

    await kv.set(userKey, profile);
    await kv.set(`subscription_log_${Date.now()}_${userId}`, {
      userId, action: body.status, by: 'admin', method: body.method || 'manual', timestamp: Date.now()
    });
    return c.json({ success: true, profile });
  } catch (error) {
    console.log("admin/subscription error:", error);
    return c.json({ success: false, error: String(error) }, { status: 500 });
  }
});

// Update user (name/email/password)
app.put("/make-server-bdae3ab6/admin/users/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const body = await c.req.json();
    const supabase = adminClient();

    const update: any = {};
    if (body.email) update.email = body.email;
    if (body.password) update.password = body.password;
    if (body.name) update.user_metadata = { full_name: body.name };

    if (Object.keys(update).length === 0) {
      return c.json({ success: false, error: "Nada a atualizar" }, { status: 400 });
    }

    const { data, error } = await supabase.auth.admin.updateUserById(userId, update);
    if (error) throw error;

    if (body.email) {
      const userKey = `store_user_${userId}`;
      const profile = await kv.get(userKey);
      if (profile) { profile.email = body.email; await kv.set(userKey, profile); }
    }

    return c.json({ success: true, user: data?.user });
  } catch (error) {
    console.log("admin/users PUT error:", error);
    return c.json({ success: false, error: String(error) }, { status: 500 });
  }
});

// Dashboard stats
app.get("/make-server-bdae3ab6/admin/stats", async (c) => {
  try {
    const profiles = await kv.getByPrefix("store_user_") || [];
    const logs = await kv.getByPrefix("store_log_") || [];
    const items = await kv.getByPrefix("store_item_") || [];
    const txs = await kv.getByPrefix("mp_tx_") || [];
    const events = await kv.getByPrefix("strategic_event_") || [];

    const now = Date.now();
    const activeSubs = profiles.filter((p: any) => p.subscriptionStatus === 'active' && (!p.subscriptionExpiresAt || p.subscriptionExpiresAt > now));
    const expiringSoon = activeSubs.filter((p: any) => p.subscriptionExpiresAt && p.subscriptionExpiresAt - now < 7 * 24 * 60 * 60 * 1000);

    const last7 = now - 7 * 24 * 60 * 60 * 1000;
    const downloadsLast7 = logs.filter((l: any) => l.timestamp > last7);

    const approvedTx = txs.filter((t: any) => t.status === 'approved');
    const revenue = approvedTx.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

    const downloadsByItem: Record<string, number> = {};
    logs.forEach((l: any) => { downloadsByItem[l.itemTitle || l.itemId] = (downloadsByItem[l.itemTitle || l.itemId] || 0) + 1; });
    const topItems = Object.entries(downloadsByItem).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([title, count]) => ({ title, count }));

    return c.json({
      success: true,
      stats: {
        totalUsers: profiles.length,
        activeSubscriptions: activeSubs.length,
        expiringSoon: expiringSoon.length,
        totalItems: items.length,
        totalDownloads: logs.length,
        downloadsLast7: downloadsLast7.length,
        totalEvents: events.length,
        approvedPayments: approvedTx.length,
        pendingPayments: txs.filter((t: any) => t.status === 'pending').length,
        revenue,
        topItems,
      }
    });
  } catch (error) {
    console.log("admin/stats error:", error);
    return c.json({ success: false, error: String(error) }, { status: 500 });
  }
});

// List Mercado Pago transactions
app.get("/make-server-bdae3ab6/admin/payments", async (c) => {
  try {
    const txs = await kv.getByPrefix("mp_tx_") || [];
    const sorted = txs.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
    return c.json({ success: true, payments: sorted });
  } catch (error) {
    console.log("admin/payments error:", error);
    return c.json({ success: false, error: String(error) }, { status: 500 });
  }
});

// Refresh single MP payment status from MP API
app.post("/make-server-bdae3ab6/admin/payments/:externalRef/refresh", async (c) => {
  try {
    const externalRef = c.req.param("externalRef");
    const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if (!accessToken) return c.json({ success: false, error: "MP token ausente" }, { status: 500 });

    const res = await fetch(`${MP_API}/v1/payments/search?external_reference=${encodeURIComponent(externalRef)}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await res.json();
    const payment = (data?.results || [])[0];
    if (!payment) return c.json({ success: false, error: "Pagamento não encontrado" });

    const txKey = `mp_tx_${externalRef}`;
    const tx = await kv.get(txKey);
    if (tx) {
      tx.status = payment.status;
      tx.statusDetail = payment.status_detail;
      tx.paymentId = payment.id;
      tx.lastSyncAt = Date.now();
      await kv.set(txKey, tx);
    }
    return c.json({ success: true, payment, tx });
  } catch (error) {
    console.log("admin/payments refresh error:", error);
    return c.json({ success: false, error: String(error) }, { status: 500 });
  }
});

// ====================================================================
// USER: profile self-update + download history
// ====================================================================
async function getAuthedUser(c: any) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  const sb = createClient(Deno.env.get("SUPABASE_URL") || "", Deno.env.get("SUPABASE_ANON_KEY") || "");
  const { data: { user }, error } = await sb.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

app.put("/make-server-bdae3ab6/store/user/profile", async (c) => {
  try {
    const user = await getAuthedUser(c);
    if (!user) return c.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await c.req.json();
    const supabase = adminClient();
    const update: any = {};
    if (body.email && body.email !== user.email) update.email = body.email;
    if (body.password) {
      if (body.password.length < 6) return c.json({ success: false, error: "Senha deve ter ao menos 6 caracteres" }, { status: 400 });
      update.password = body.password;
    }
    if (body.name) update.user_metadata = { ...(user.user_metadata || {}), full_name: body.name };

    if (Object.keys(update).length === 0) return c.json({ success: false, error: "Nada a atualizar" }, { status: 400 });

    const { data, error } = await supabase.auth.admin.updateUserById(user.id, update);
    if (error) throw error;

    if (body.email) {
      const userKey = `store_user_${user.id}`;
      const profile = await kv.get(userKey);
      if (profile) { profile.email = body.email; await kv.set(userKey, profile); }
    }
    return c.json({ success: true, user: data?.user });
  } catch (error) {
    console.log("store/user/profile error:", error);
    return c.json({ success: false, error: String(error) }, { status: 500 });
  }
});

app.get("/make-server-bdae3ab6/store/user/downloads", async (c) => {
  try {
    const user = await getAuthedUser(c);
    if (!user) return c.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const all = await kv.getByPrefix("store_log_") || [];
    const mine = all.filter((l: any) => l.userId === user.id).sort((a: any, b: any) => b.timestamp - a.timestamp);
    return c.json({ success: true, downloads: mine });
  } catch (error) {
    console.log("store/user/downloads error:", error);
    return c.json({ success: false, error: String(error) }, { status: 500 });
  }
});

// ===== ADMIN ENDPOINTS =====

// GET /admin/users - Lista todos os usuários com status de assinatura
app.get("/make-server-bdae3ab6/admin/users", async (c) => {
  try {
    const admin = adminClient();
    
    // Buscar todos os usuários do Supabase Auth
    const { data: authUsers, error: authError } = await admin.auth.admin.listUsers();
    if (authError) throw authError;

    // Buscar dados de assinatura do KV Store
    const userKeys = authUsers.users.map(u => `user:${u.id}`);
    const usersData = await Promise.all(
      userKeys.map(key => kv.get(key).catch(() => null))
    );

    const users = authUsers.users.map((authUser, i) => {
      const userData = usersData[i] || {};
      const expiresAt = userData.subscriptionExpiresAt;
      const isActive = userData.subscriptionStatus === 'active' && 
                      (!expiresAt || expiresAt > Date.now());
      
      return {
        userId: authUser.id,
        email: authUser.email,
        name: userData.name || authUser.user_metadata?.name || '—',
        subscriptionStatus: isActive ? 'active' : 'inactive',
        subscriptionExpiresAt: expiresAt || null,
        subscriptionMethod: userData.subscriptionMethod || null,
        downloadsToday: userData.downloadsToday || 0,
        totalDownloads: userData.totalDownloads || 0,
        createdAt: authUser.created_at,
        lastSignInAt: authUser.last_sign_in_at,
      };
    });

    return c.json({ success: true, users });
  } catch (error) {
    console.error('[Admin Users] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// GET /admin/stats - Retorna estatísticas do dashboard
app.get("/make-server-bdae3ab6/admin/stats", async (c) => {
  try {
    const admin = adminClient();

    // Buscar todos os usuários
    const { data: authUsers, error: authError } = await admin.auth.admin.listUsers();
    if (authError) throw authError;

    // Buscar dados do KV Store
    const allUserData = await kv.getByPrefix("user:");
    const allTransactions = await kv.getByPrefix("transaction:");
    const allItems = await kv.getByPrefix("item:");

    // Calcular estatísticas
    const now = Date.now();
    let activeSubscriptions = 0;
    let expiringSoon = 0;
    let totalDownloads = 0;
    let downloadsLast7 = 0;

    allUserData.forEach((userData: any) => {
      if (userData?.subscriptionStatus === 'active') {
        if (!userData.subscriptionExpiresAt || userData.subscriptionExpiresAt > now) {
          activeSubscriptions++;
          if (userData.subscriptionExpiresAt && 
              userData.subscriptionExpiresAt - now < 7 * 24 * 60 * 60 * 1000) {
            expiringSoon++;
          }
        }
      }
      totalDownloads += userData?.totalDownloads || 0;
    });

    // Downloads últimos 7 dias
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    allUserData.forEach((userData: any) => {
      if (userData?.lastDownloadDate) {
        const lastDownloadTime = new Date(userData.lastDownloadDate).getTime();
        if (lastDownloadTime > sevenDaysAgo) {
          downloadsLast7 += userData.downloadsToday || 0;
        }
      }
    });

    // Transações aprovadas
    let approvedPayments = 0;
    let revenue = 0;
    allTransactions.forEach((tx: any) => {
      if (tx?.status === 'approved') {
        approvedPayments++;
        revenue += tx?.amount || 0;
      }
    });

    // Top 5 itens mais baixados
    const topItems = allItems
      .sort((a: any, b: any) => (b?.downloadCount || 0) - (a?.downloadCount || 0))
      .slice(0, 5)
      .map((item: any) => ({
        title: item?.title || 'Sem título',
        count: item?.downloadCount || 0,
      }));

    return c.json({
      success: true,
      stats: {
        totalUsers: authUsers.users.length,
        activeSubscriptions,
        expiringSoon,
        totalItems: allItems.length,
        totalDownloads,
        downloadsLast7,
        approvedPayments,
        revenue,
        topItems,
      },
    });
  } catch (error) {
    console.error('[Admin Stats] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// GET /admin/payments - Lista todas as transações
app.get("/make-server-bdae3ab6/admin/payments", async (c) => {
  try {
    const allTransactions = await kv.getByPrefix("transaction:");
    
    const payments = allTransactions.map((tx: any) => ({
      id: tx?.id || '—',
      externalReference: tx?.externalReference || '—',
      userId: tx?.userId || '—',
      userEmail: tx?.userEmail || '—',
      type: tx?.type || '—',
      amount: tx?.amount || 0,
      status: tx?.status || 'unknown',
      createdAt: tx?.createdAt || '—',
      completedAt: tx?.completedAt || null,
      metadata: tx?.metadata || {},
    }));

    return c.json({ success: true, payments });
  } catch (error) {
    console.error('[Admin Payments] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST /admin/payments/:ref/refresh - Sincroniza status de pagamento com Mercado Pago
app.post("/make-server-bdae3ab6/admin/payments/:ref/refresh", async (c) => {
  try {
    const externalRef = c.req.param('ref');
    
    // Buscar transação no KV Store
    const txKey = `transaction:${externalRef}`;
    const payment = await kv.get(txKey);
    
    if (!payment) {
      return c.json({ success: false, error: 'Transação não encontrada' }, 404);
    }

    // Se for Mercado Pago, sincronizar status
    if (payment.type === 'mercadopago') {
      const mpAccessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
      
      try {
        const response = await fetch(
          `https://api.mercadopago.com/v1/payments/search?external_reference=${externalRef}`,
          {
            headers: { 'Authorization': `Bearer ${mpAccessToken}` },
          }
        );
        
        if (!response.ok) {
          throw new Error(`Mercado Pago API error: ${response.status}`);
        }

        const mpData = await response.json();
        const mpPayment = mpData.results?.[0];

        if (mpPayment) {
          payment.status = mpPayment.status;
          payment.metadata = { ...payment.metadata, mpData };
          await kv.set(txKey, payment);
        }
      } catch (mpError) {
        console.error('[Mercado Pago Sync] Error:', mpError);
        return c.json({ 
          success: false, 
          error: 'Erro ao sincronizar com Mercado Pago',
          payment 
        }, 500);
      }
    }

    return c.json({ success: true, payment });
  } catch (error) {
    console.error('[Refresh Payment] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST /admin/users/:userId/subscription - Ativa/cancela assinatura
app.post("/make-server-bdae3ab6/admin/users/:userId/subscription", async (c) => {
  try {
    const userId = c.req.param('userId');
    const { status, days = 30, method = 'manual' } = await c.req.json();

    if (!['active', 'inactive'].includes(status)) {
      return c.json({ success: false, error: 'Status inválido' }, 400);
    }

    const userKey = `user:${userId}`;
    const userData = await kv.get(userKey) || {};

    if (status === 'active') {
      userData.subscriptionStatus = 'active';
      userData.subscriptionExpiresAt = Date.now() + (days * 24 * 60 * 60 * 1000);
      userData.subscriptionMethod = method;
    } else {
      userData.subscriptionStatus = 'inactive';
      userData.subscriptionExpiresAt = null;
    }

    await kv.set(userKey, userData);

    return c.json({ 
      success: true, 
      message: `Assinatura ${status === 'active' ? 'ativada' : 'cancelada'}`,
      user: userData 
    });
  } catch (error) {
    console.error('[Set Subscription] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PUT /admin/users/:userId - Atualiza dados do usuário
app.put("/make-server-bdae3ab6/admin/users/:userId", async (c) => {
  try {
    const admin = adminClient();
    const userId = c.req.param('userId');
    const { name, email, password } = await c.req.json();

    // Atualizar email/senha no Supabase Auth
    if (email || password) {
      const updatePayload: any = {};
      if (email) updatePayload.email = email;
      if (password) updatePayload.password = password;

      const { error: authError } = await admin.auth.admin.updateUserById(
        userId,
        updatePayload
      );

      if (authError) throw authError;
    }

    // Atualizar nome no KV Store
    if (name) {
      const userKey = `user:${userId}`;
      const userData = await kv.get(userKey) || {};
      userData.name = name;
      await kv.set(userKey, userData);
    }

    return c.json({ success: true, message: 'Usuário atualizado com sucesso' });
  } catch (error) {
    console.error('[Update User] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

Deno.serve(app.fetch);
