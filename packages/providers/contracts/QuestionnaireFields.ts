import type { QuestionnaireField } from './AccountProvider'

export const SKIN_QUESTIONNAIRE_FIELDS: QuestionnaireField[] = [
  {
    id: 'skinType',
    label: 'Skin type',
    type: 'select',
    required: true,
    options: [
      { value: 'oily', label: 'Oily' },
      { value: 'dry', label: 'Dry' },
      { value: 'combination', label: 'Combination' },
      { value: 'normal', label: 'Normal' },
      { value: 'sensitive', label: 'Sensitive' },
    ],
  },
  {
    id: 'primaryConcern',
    label: 'Primary concern',
    type: 'select',
    required: true,
    options: [
      { value: 'acne', label: 'Acne / breakouts' },
      { value: 'aging', label: 'Fine lines / aging' },
      { value: 'pigmentation', label: 'Dark spots / pigmentation' },
      { value: 'redness', label: 'Redness / rosacea' },
      { value: 'dullness', label: 'Dullness / uneven tone' },
      { value: 'dehydration', label: 'Dehydration' },
    ],
  },
  {
    id: 'sensitivityLevel',
    label: 'Sensitivity level',
    type: 'range',
    required: true,
    min: 1,
    max: 5,
  },
  {
    id: 'currentCleanser',
    label: 'Current cleanser',
    type: 'text',
    placeholder: 'Brand and product name',
  },
  {
    id: 'currentMoisturizer',
    label: 'Current moisturizer',
    type: 'text',
    placeholder: 'Brand and product name',
  },
  {
    id: 'usesSPF',
    label: 'Uses SPF daily',
    type: 'boolean',
  },
  {
    id: 'sleepHours',
    label: 'Average sleep (hours)',
    type: 'number',
    min: 4,
    max: 12,
    unit: 'hours',
  },
  {
    id: 'waterIntake',
    label: 'Water intake',
    type: 'select',
    options: [
      { value: 'low', label: 'Low (< 4 cups)' },
      { value: 'moderate', label: 'Moderate (4–8 cups)' },
      { value: 'high', label: 'High (8+ cups)' },
    ],
  },
  {
    id: 'makeupFrequency',
    label: 'Makeup frequency',
    type: 'select',
    options: [
      { value: 'daily', label: 'Daily' },
      { value: 'weekly', label: 'A few times a week' },
      { value: 'rarely', label: 'Rarely' },
      { value: 'never', label: 'Never' },
    ],
  },
  {
    id: 'previousTreatments',
    label: 'Previous skin treatments',
    type: 'multiselect',
    options: [
      { value: 'chemicalPeel', label: 'Chemical peel' },
      { value: 'microdermabrasion', label: 'Microdermabrasion' },
      { value: 'laser', label: 'Laser treatment' },
      { value: 'microneedling', label: 'Microneedling' },
      { value: 'none', label: 'None' },
    ],
  },
]

export const HAIR_QUESTIONNAIRE_FIELDS: QuestionnaireField[] = [
  {
    id: 'hairType',
    label: 'Hair type',
    type: 'select',
    required: true,
    options: [
      { value: 'straight', label: 'Straight' },
      { value: 'wavy', label: 'Wavy' },
      { value: 'curly', label: 'Curly' },
      { value: 'coily', label: 'Coily' },
    ],
  },
  {
    id: 'scalpCondition',
    label: 'Scalp condition',
    type: 'select',
    required: true,
    options: [
      { value: 'dry', label: 'Dry' },
      { value: 'oily', label: 'Oily' },
      { value: 'normal', label: 'Normal' },
      { value: 'dandruff', label: 'Dandruff / flaking' },
      { value: 'sensitive', label: 'Sensitive' },
    ],
  },
  {
    id: 'primaryConcern',
    label: 'Primary concern',
    type: 'select',
    required: true,
    options: [
      { value: 'hairLoss', label: 'Hair loss / shedding' },
      { value: 'thinning', label: 'Thinning / low density' },
      { value: 'damage', label: 'Damage / breakage' },
      { value: 'frizz', label: 'Frizz / flyaways' },
      { value: 'dandruff', label: 'Dandruff / scalp flakes' },
      { value: 'dullness', label: 'Dullness / lack of shine' },
    ],
  },
  {
    id: 'washFrequency',
    label: 'Wash frequency',
    type: 'select',
    options: [
      { value: 'daily', label: 'Daily' },
      { value: 'everyOtherDay', label: 'Every other day' },
      { value: 'twiceWeekly', label: 'Twice a week' },
      { value: 'weekly', label: 'Once a week' },
    ],
  },
  {
    id: 'usesHeatStyling',
    label: 'Uses heat styling',
    type: 'boolean',
  },
  {
    id: 'chemicallyTreated',
    label: 'Chemically treated',
    type: 'boolean',
  },
  {
    id: 'hairLength',
    label: 'Hair length',
    type: 'select',
    options: [
      { value: 'short', label: 'Short' },
      { value: 'medium', label: 'Medium' },
      { value: 'long', label: 'Long' },
    ],
  },
  {
    id: 'strandThickness',
    label: 'Strand thickness',
    type: 'select',
    options: [
      { value: 'fine', label: 'Fine' },
      { value: 'medium', label: 'Medium' },
      { value: 'coarse', label: 'Coarse' },
    ],
  },
  {
    id: 'previousTreatments',
    label: 'Previous hair treatments',
    type: 'multiselect',
    options: [
      { value: 'keratin', label: 'Keratin treatment' },
      { value: 'botox', label: 'Hair botox' },
      { value: 'protein', label: 'Protein treatment' },
      { value: 'coloring', label: 'Coloring / dye' },
      { value: 'bleaching', label: 'Bleaching' },
      { value: 'none', label: 'None' },
    ],
  },
]

export function getQuestionnaireFields(templateType: 'skin' | 'hair'): QuestionnaireField[] {
  return templateType === 'skin' ? SKIN_QUESTIONNAIRE_FIELDS : HAIR_QUESTIONNAIRE_FIELDS
}
