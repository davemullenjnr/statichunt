import fs from "fs";
import matter from "gray-matter";
import path from "path";
const jsonDir = "./.json";

// get list page data (ex: about.md)
const getListPageData = (folder, filename) => {
  const slug = filename.replace(".md", "");
  const fileData = fs.readFileSync(path.join(folder, filename), "utf-8");
  const { data } = matter(fileData);
  const content = matter(fileData).content;

  return {
    frontmatter: data,
    content: content,
    slug: slug,
  };
};

// get single page data (ex: blog/*.md)
const getSinglePageData = (folder, includeDrafts) => {
  const getPath = fs.readdirSync(path.join(folder));
  const sanitizeData = getPath.filter((item) => item.includes(".md"));
  const filterData = sanitizeData.filter((item) => item.match(/^(?!_)/));
  const allPages = filterData.map((filename) =>
    getListPageData(folder, filename),
  );
  const publishedPages = allPages.filter(
    (page) => !page.frontmatter?.draft && page,
  );
  return includeDrafts ? allPages : publishedPages;
};

// get themes name
const getThemesName = () => {
  const getAllData = getSinglePageData("content/themes", false);
  return getAllData.map((item) => item.slug);
};

// get custom data
const getThemesGithub = () => {
  const getAllData = getSinglePageData("content/themes", false);
  return getAllData
    .map((item) => (item.frontmatter.github ? item.frontmatter.github : ""))
    .filter((item) => item !== "");
};

// get custom data
const getCustomData = () => {
  const getAllData = getSinglePageData("content/themes", false);
  const customData = getAllData.map((item) => item.slug);
  return customData;
};

// get all data
const themes = getSinglePageData("content/themes", false);
const tools = getSinglePageData("content/tools", false);
const examples = getSinglePageData("content/examples", false);
const blog = getSinglePageData("content/blog", false);
const ssg = getSinglePageData("content/ssg", true);
const css = getSinglePageData("content/css", true);
const cms = getSinglePageData("content/cms", true);
const category = getSinglePageData("content/category", true);
const sponsors = getListPageData("content/sponsors", "index.md");
const themeTools = [...ssg, ...css, ...cms, ...category];

try {
  if (!fs.existsSync(jsonDir)) {
    fs.mkdirSync(jsonDir);
  }
  fs.writeFileSync(`${jsonDir}/themes.json`, JSON.stringify(themes));
  fs.writeFileSync(`${jsonDir}/tools.json`, JSON.stringify(tools));
  fs.writeFileSync(`${jsonDir}/examples.json`, JSON.stringify(examples));
  fs.writeFileSync(`${jsonDir}/theme-tools.json`, JSON.stringify(themeTools));
  fs.writeFileSync(`${jsonDir}/blog.json`, JSON.stringify(blog));
  fs.writeFileSync(`${jsonDir}/sponsors.json`, JSON.stringify(sponsors));
  fs.writeFileSync(
    `${jsonDir}/themes-name.json`,
    JSON.stringify(getThemesName()),
  );
  fs.writeFileSync(
    `${jsonDir}/themes-github.json`,
    JSON.stringify(getThemesGithub()),
  );
} catch (err) {
  console.error(err);
}
