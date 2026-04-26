declare module "pdf-parse" {
  import { Buffer } from "buffer";
  function pdfParse(data: Buffer): Promise<{ text: string; numpages?: number }>;
  export default pdfParse;
}
