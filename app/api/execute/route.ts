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

    // For JavaScript, we can use a simple eval in a try-catch
    if (language === "javascript") {
      try {
        // Create a function from the code to capture console.log output
        let output = ""
        const originalConsoleLog = console.log
        console.log = (...args) => {
          output += args.join(" ") + "\n"
        }

        // Execute the code
        const func = new Function(code)
        func()

        // Restore console.log
        console.log = originalConsoleLog

        return NextResponse.json(
          {
            output: output || "Code executed successfully with no output.",
          },
          { status: 200 },
        )
      } catch (error) {
        return NextResponse.json(
          {
            output: `Error: ${error.message}`,
          },
          { status: 200 },
        )
      }
    }

    // For other languages, we need to create a file and execute it
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
      const command = `${langConfig.command} ${filename}`

      // Execute code with timeout
      const { stdout, stderr } = await execPromise(command, {
        cwd: tempDir,
        timeout: 10000, // 10 second timeout
      })

      return NextResponse.json({ output: stdout || stderr }, { status: 200 })
    } catch (error) {
      console.error("Error executing code:", error)

      // Handle timeout errors
      if (error.signal === "SIGTERM") {
        return NextResponse.json({ output: "Execution timed out (limit: 10 seconds)" }, { status: 200 })
      }

      return NextResponse.json({ output: `Error: ${error.message || "Unknown error occurred"}` }, { status: 200 })
    } finally {
      // Clean up temporary directory
      try {
        await rm(tempDir, { recursive: true, force: true })
      } catch (error) {
        console.error("Error cleaning up temp directory:", error)
      }
    }
  } catch (error) {
    console.error("Error executing code:", error)
    return NextResponse.json({ output: `Error: ${error.message || "Unknown error occurred"}` }, { status: 200 })
  }
}

