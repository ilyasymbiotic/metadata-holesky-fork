import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

type Info = Partial<{
  name: string;
  description: string;
  tags: string[];
  cmcId: string;
  links: [
    {
      type: string;
      name: string;
      url: string;
    },
    {
      type: string;
      name: string;
      url: string;
    },
    {
      type: string;
      name: string;
      url: string;
    }
  ];
}>;

type Entity = {
  info: Info;
  logo: string;
};

enum DIRECTORIES {
  VAULTS = "vaults",
  TOKENS = "tokens",
  NETWORKS = "networks",
  OPERATORS = "operators",
}

type Template = Record<DIRECTORIES, Entity[]>;

async function grabEntitiesInfo(globalDirs: DIRECTORIES[]) {
  const result = Object.values(DIRECTORIES).reduce<Template>((acc, curr) => {
    acc[curr] = [];
    return acc;
  }, {} as Template);

  for (const dir of globalDirs) {
    try {
      const subdirs = await fs.readdir(dir);
      for (const subdir of subdirs) {
        const entityPath = path.join(dir, subdir);
        try {
          const infoPath = path.join(entityPath, "info.json");
          const logoPath = path.join(entityPath, "logo.png");
          const infoUrl = pathToFileURL(infoPath).href;

          const module = await import(infoUrl);
          const info: Info = module.default;
          result[dir as DIRECTORIES].push({ info, logo: logoPath });
        } catch (error) {
          console.error(`Error processing entity in ${entityPath}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error);
    }
  }

  // console.log(JSON.stringify(result), null, "\t");
  console.log({ result });
}

grabEntitiesInfo(Object.values(DIRECTORIES));
