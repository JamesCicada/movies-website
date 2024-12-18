// /pages/api/sitemap-index.ts
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const sitemapsCount = 381; // Define based on total number of Movies entries/pages

  res.setHeader("Content-Type", "application/xml");
  res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${Array.from({ length: sitemapsCount })
        .map((_, index) => `<sitemap><loc>https://Movies.jcwatch.com/api/sitemap/${index + 1}</loc></sitemap>`)
        .join("")}
    </sitemapindex>`);
}
