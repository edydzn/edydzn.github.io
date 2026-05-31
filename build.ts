// Build script for Deno deployment
// This script builds the frontend assets using Vite

async function build() {
  console.log("Building frontend with Vite...");

  const command = new Deno.Command("npm", {
    args: ["run", "build"],
    stdout: "inherit",
    stderr: "inherit",
  });

  const { code } = await command.output();

  if (code !== 0) {
    console.error("Build failed!");
    Deno.exit(1);
  }

  console.log("Build completed successfully!");
  console.log("Static files are in the ./dist directory");
}

if (import.meta.main) {
  await build();
}
