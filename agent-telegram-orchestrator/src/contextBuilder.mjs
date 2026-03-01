import { readFile } from "node:fs/promises";
import path from "node:path";

const PROFILE_DIR = path.resolve(process.cwd(), "project-profiles");

export async function buildProjectContext(parsed) {
  const profileId = parsed.args.project || parsed.args.profile;
  if (!profileId) {
    return {
      profileId: null,
      projectContext: "No explicit project profile provided. Use generic workflow context."
    };
  }

  const profilePath = path.join(PROFILE_DIR, `${profileId}.json`);
  try {
    const raw = await readFile(profilePath, "utf8");
    const profile = JSON.parse(raw);

    const projectContext = [
      `Project Profile: ${profile.name}`,
      `Goal: ${profile.productGoal}`,
      `Users: ${(profile.targetUsers || []).join(", ")}`,
      `Core Features: ${(profile.coreFeatures || []).join(", ")}`,
      `NFR: ${(profile.nonFunctional || []).join(", ")}`,
      `Suggested Stack: ${JSON.stringify(profile.suggestedStack || {})}`
    ].join("\n");

    return { profileId, profile, projectContext };
  } catch {
    return {
      profileId,
      projectContext: `Profile '${profileId}' not found. Continue with user input only.`
    };
  }
}
