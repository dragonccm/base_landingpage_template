import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";

function slugify(text = "project") {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "project";
}

export function detectStack(text = "", args = {}) {
  const hint = `${args.stack || ""} ${text}`.toLowerCase();
  if (hint.includes("react native") || hint.includes("android") || hint.includes("ios") || hint.includes("mobile")) return "react-native";
  if (hint.includes("nextjs") || hint.includes("next.js") || hint.includes("ssr")) return "nextjs";
  if (hint.includes("reactjs") || hint.includes("react.js") || hint.includes("spa")) return "react";
  if (hint.includes("nodejs") || hint.includes("node.js") || hint.includes("api") || hint.includes("backend")) return "node";
  return "nextjs";
}

async function ensureEmpty(dir) {
  try {
    await access(dir);
    throw new Error(`Project directory already exists: ${dir}`);
  } catch {}
}

async function writeJson(file, obj) {
  await writeFile(file, JSON.stringify(obj, null, 2), "utf8");
}

async function scaffoldReactNative(projectDir, name) {
  await mkdir(projectDir, { recursive: true });
  await writeJson(path.join(projectDir, "package.json"), {
    name,
    version: "0.1.0",
    private: true,
    scripts: { start: "expo start", android: "expo start --android", ios: "expo start --ios", web: "expo start --web" },
    dependencies: { expo: "~53.0.0", react: "19.0.0", "react-native": "0.79.0" }
  });
  await writeFile(path.join(projectDir, "App.js"), "import { SafeAreaView, Text } from 'react-native';\nexport default function App(){return <SafeAreaView style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text>Expense App Starter</Text></SafeAreaView>}\n", "utf8");
  await writeFile(path.join(projectDir, "README.md"), "# React Native Expense App\n\n## Run\n1. npm install\n2. npm run android (or npm start)\n", "utf8");
}

async function scaffoldNext(projectDir, name) {
  await mkdir(projectDir, { recursive: true });
  await writeJson(path.join(projectDir, "package.json"), {
    name,
    version: "0.1.0",
    private: true,
    scripts: { dev: "next dev", build: "next build", start: "next start" },
    dependencies: { next: "15.2.0", react: "19.0.0", "react-dom": "19.0.0" }
  });
  await mkdir(path.join(projectDir, "app"), { recursive: true });
  await writeFile(path.join(projectDir, "app", "page.jsx"), "export default function Page(){return <main><h1>Expense Dashboard</h1></main>}\n", "utf8");
  await writeFile(path.join(projectDir, "README.md"), "# Next.js Project\n\n## Run\n1. npm install\n2. npm run dev\n", "utf8");
}

async function scaffoldReact(projectDir, name) {
  await mkdir(projectDir, { recursive: true });
  await writeJson(path.join(projectDir, "package.json"), {
    name,
    version: "0.1.0",
    private: true,
    scripts: { dev: "vite", build: "vite build" },
    dependencies: { react: "19.0.0", "react-dom": "19.0.0" },
    devDependencies: { vite: "6.2.0" }
  });
  await mkdir(path.join(projectDir, "src"), { recursive: true });
  await writeFile(path.join(projectDir, "index.html"), "<div id='root'></div><script type='module' src='/src/main.jsx'></script>", "utf8");
  await writeFile(path.join(projectDir, "src", "main.jsx"), "import {createRoot} from 'react-dom/client';createRoot(document.getElementById('root')).render(<h1>Expense Web App</h1>);", "utf8");
  await writeFile(path.join(projectDir, "README.md"), "# React App\n\n## Run\n1. npm install\n2. npm run dev\n", "utf8");
}

async function scaffoldNode(projectDir, name) {
  await mkdir(projectDir, { recursive: true });
  await writeJson(path.join(projectDir, "package.json"), { name, version: "0.1.0", private: true, type: "module", scripts: { dev: "node src/index.js" } });
  await mkdir(path.join(projectDir, "src"), { recursive: true });
  await writeFile(path.join(projectDir, "src", "index.js"), "import http from 'node:http';http.createServer((req,res)=>{res.end('Expense API');}).listen(3000);console.log('API on 3000');\n", "utf8");
  await writeFile(path.join(projectDir, "README.md"), "# Node API\n\n## Run\n1. npm install\n2. npm run dev\n", "utf8");
}

export async function scaffoldProject({ baseDir, requestText, stackHint }) {
  const stack = detectStack(requestText, { stack: stackHint });
  const slug = slugify(requestText || `project-${stack}`);
  const projectName = `${stack}-${slug}`.slice(0, 70);
  const projectDir = path.join(baseDir, "generated-projects", projectName);
  await ensureEmpty(projectDir);

  if (stack === "react-native") await scaffoldReactNative(projectDir, projectName);
  else if (stack === "nextjs") await scaffoldNext(projectDir, projectName);
  else if (stack === "react") await scaffoldReact(projectDir, projectName);
  else await scaffoldNode(projectDir, projectName);

  const runbook = `# RUNBOOK\n\n- Stack: ${stack}\n- Project: ${projectName}\n- Path: ${projectDir}\n\n## Next\n1. cd \"${projectDir}\"\n2. npm install\n3. Run script from README\n`;
  await writeFile(path.join(projectDir, "RUNBOOK.md"), runbook, "utf8");

  return { stack, projectName, projectDir };
}
