/**
 * Feelings list derived from common NVC inventories + your workbook lists.
 * Categories are UI-only; validation is handled by AI when user types custom.
 */
export const FEELING_GROUPS = [
  {
    title: "When needs are satisfied",
    items: [
      "affectionate","compassionate","friendly","loving","open-hearted","sympathetic","tender","warm",
      "confident","empowered","proud","safe","secure",
      "engaged","absorbed","alert","curious","fascinated","interested","intrigued","involved","stimulated",
      "inspired","amazed","awed","wonder",
      "excited","animated","eager","energetic","enthusiastic","invigorated","lively","passionate","surprised",
      "exhilarated","blissful","ecstatic","elated","thrilled",
      "grateful","appreciative","thankful","touched",
      "hopeful","encouraged","optimistic","expectant",
      "joyful","amused","delighted","glad","happy","pleased",
      "peaceful","calm","clear-headed","content","relaxed","relieved","serene","tranquil","trusting",
      "refreshed","rejuvenated","rested","renewed"
    ]
  },
  {
    title: "When needs are not satisfied",
    items: [
      "afraid","apprehensive","frightened","panicked","scared","terrified","wary","worried",
      "annoyed","aggravated","exasperated","frustrated","impatient","irritated",
      "angry","enraged","furious","incensed","indignant","outraged","resentful",
      "averse","appalled","disgusted","horrified","hostile","repulsed",
      "confused","baffled","bewildered","hesitant","lost","perplexed","torn",
      "disconnected","alienated","apathetic","bored","detached","distant","indifferent","numb","withdrawn",
      "disquiet","agitated","alarmed","disturbed","uneasy","unsettled","upset",
      "embarrassed","ashamed","guilty","mortified","self-conscious",
      "fatigued","burnt out","exhausted","tired","weary",
      "in pain","anguished","devastated","heartbroken","hurt","lonely","miserable","regretful",
      "sad","dejected","despairing","discouraged","hopeless","melancholy","unhappy",
      "tense","anxious","edgy","overwhelmed","stressed",
      "vulnerable","fragile","guarded","helpless","insecure","sensitive","shaky",
      "yearning","longing","nostalgic","pining","wistful","jealous","envious"
    ]
  }
];

export const NOT_FEELINGS_EXAMPLES = [
  // “Interpretations are not feelings” style examples:
  "ignored","attacked","betrayed","boxed in","bullied","cheated","cornered","diminished","distrusted",
  "intimidated","put down","rejected","taken for granted","misunderstood","neglected","pressured",
  "provoked","threatened","unappreciated","unheard","unseen","used","unsupported","unwanted"
];
