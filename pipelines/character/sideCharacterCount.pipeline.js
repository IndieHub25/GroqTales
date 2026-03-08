/**
 * Side Character Count Pipeline
 *
 * Generates supporting characters and assigns each one a narrative role.
 * Roles cycle through a pool: mentor, friend, rival, sidekick, guardian, informant.
 * Side characters are appended to the existing character list.
 */

export function sideCharacterCountPipeline(params, context) {
  const count = params.sideCharacterCount || 2

  const rolePool = ["mentor", "friend", "rival", "sidekick", "guardian", "informant"]

  const sideCharacters = []

  for (let i = 0; i < count; i++) {
    const assignedRole = rolePool[i % rolePool.length]

    sideCharacters.push({
      id: "side_character_" + (i + 1),
      name: "Side Character " + (i + 1),
      role: assignedRole,
      archetype: null,
      depth: "simple",
      depthScore: 1,
      traits: [],
      flaws: [],
      goals: [],
      background: null,
      profession: null,
      speechStyle: null,
      speechPattern: null,
      motivationClarity: null,
      arc: null
    })
  }

  context.characters = context.characters.concat(sideCharacters)
  return context
}
