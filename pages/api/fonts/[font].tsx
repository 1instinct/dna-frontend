import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const fontPath = path.join(process.cwd(), `public/fonts/${req.query.font}.woff2`);
  const fontData = fs.readFileSync(fontPath);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Content-Type", "font/woff2");

  res.write(fontData);

  res.end();
}
