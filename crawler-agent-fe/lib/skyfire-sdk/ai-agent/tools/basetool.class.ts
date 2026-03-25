import { tool } from "ai"
import { z } from "zod"

export class BaseTool {
  public static readonly toolName: string = "base_tool"
  public static readonly instruction: string = ""

  constructor(protected config?: any) {
    this.config = config
  }

  public createTool(...args: any[]) {
    return this.createBaseTool(
      "Base tool description",
      z.object({}),
      async () => ({ success: true })
    )
  }

  public static ClientComponent: React.FC<any> = () => null

  protected createBaseTool(
    description: string,
    parameters: z.ZodTypeAny,
    execute: (args: any) => Promise<any>
  ) {
    return tool({
      description,
      inputSchema: parameters as any, // ai SDK v4+ uses inputSchema instead of parameters
      execute: execute as any,
    })
  }
}
