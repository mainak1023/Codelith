import { type NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { writeFile, mkdir, rm } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"
import { promisify } from "util"

const execPromise = promisify(exec)

// Define supported languages and their execution commands
const languageConfigs = {
  javascript: {
    extension: "js",
    command: "node",
  },
  typescript: {
    extension: "ts",
    command: "npx ts-node",
  },
  python: {
    extension: "py",
    command: "python",
  },
  ruby: {
    extension: "rb",
    command: "ruby",
  },
  go: {
    extension: "go",
    command: "go run",
  },
  java: {
    extension: "java",
    // For Java, we need special handling for class name
    command: "javac {filename} && java {classname}",
  },
  cpp: {
    extension: "cpp",
    command: "g++ {filename} -o {executable} && ./{executable}",
  },
  php: {
    extension: "php",
    command: "php",
  },
}

export async function POST(request: NextRequest) {
  try {
    const { code, language } = await request.json()

    if (!code || !language) {
      return NextResponse.json({ error: "Code and language are required" }, { status: 400 })
    }

    // Check if language is supported
    const langConfig = languageConfigs[language]
    if (!langConfig) {
      return NextResponse.json({ output: `Language '${language}' is not supported for execution.` }, { status: 200 })
    }

    // Create a temporary directory for execution
    const sessionId = uuidv4()
    const tempDir = join("/tmp", `codelith-${sessionId}`)
    await mkdir(tempDir, { recursive: true })

    try {
      // Write code to a file
      const filename = `code.${langConfig.extension}`
      const filepath = join(tempDir, filename)
      await writeFile(filepath, code)

      // Prepare execution command
      let command = langConfig.command

      // Special handling for compiled languages
      if (language === "java") {
        // Extract class name from Java code
        const classNameMatch = code.match(/public\s+class\s+(\w+)/)
        const className = classNameMatch ? classNameMatch[1] : "Main"
        command = command.replace("{filename}", filename).replace("{classname}", className)
      } else if (language === "cpp") {
        const executable = "program"
        command = command.replace("{filename}", filename).replace(/{executable}/g, executable)
      } else {
        command = `${command} ${filename}`
      }

      // Execute code with timeout
      const { stdout, stderr } = await execPromise(command, {
        cwd: tempDir,
        timeout: 10000, // 10 second timeout
      })

      return NextResponse.json({ output: stdout || stderr }, { status: 200 })
    } finally {
      // Clean up temporary directory
      await rm(tempDir, { recursive: true, force: true })
    }
  } catch (error) {
    console.error("Error executing code:", error)

    // Handle timeout errors
    if (error.signal === "SIGTERM") {
      return NextResponse.json({ output: "Execution timed out (limit: 10 seconds)" }, { status: 200 })
    }

    return NextResponse.json({ output: `Error: ${error.message || "Unknown error occurred"}` }, { status: 200 })
  }
}

