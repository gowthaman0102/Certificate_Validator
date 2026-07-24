/**
 * Certificate Category Template Presets Definition
 * Each category features a distinct, modern, colorful professional design palette.
 */

const TEMPLATE_PRESETS = [
  {
    template_key: 'degree_template',
    template_name: 'Degree Certificate (Sapphire & Gold)',
    category: 'Degree Certificate',
    primary_color: '#0A2540',
    secondary_color: '#D4AF37',
    accent_color: '#1A365D',
    bg_gradient: 'linear-gradient(135deg, #FAFBFD 0%, #EFF4F9 100%)',
    border_style: 'double-gold-crest',
    watermark_text: 'OFFICIAL DEGREE CERTIFICATE',
    badge_title: 'OFFICIAL DEGREE',
  },
  {
    template_key: 'provisional_template',
    template_name: 'Provisional Certificate (Maroon & Rose Gold)',
    category: 'Provisional Certificate',
    primary_color: '#58111A',
    secondary_color: '#B76E79',
    accent_color: '#400A10',
    bg_gradient: 'linear-gradient(135deg, #FFFDFD 0%, #FDF2F4 100%)',
    border_style: 'classic-maroon-frame',
    watermark_text: 'PROVISIONAL CREDENTIAL',
    badge_title: 'PROVISIONAL',
  },
  {
    template_key: 'course_completion_template',
    template_name: 'Course Completion (Ocean Teal & Ice Blue)',
    category: 'Course Completion Certificate',
    primary_color: '#0F4C81',
    secondary_color: '#00A896',
    accent_color: '#028090',
    bg_gradient: 'linear-gradient(135deg, #F4FBFB 0%, #E6F7F7 100%)',
    border_style: 'modern-teal-border',
    watermark_text: 'COURSE COMPLETED',
    badge_title: 'COURSE CERTIFICATE',
  },
  {
    template_key: 'merit_template',
    template_name: 'Merit Certificate (Royal Blue & Silver)',
    category: 'Merit Certificate',
    primary_color: '#1D3557',
    secondary_color: '#457B9D',
    accent_color: '#A8DADC',
    bg_gradient: 'linear-gradient(135deg, #F8FAFC 0%, #EDF2F7 100%)',
    border_style: 'silver-crest-frame',
    watermark_text: 'CERTIFICATE OF MERIT',
    badge_title: 'MERIT EXCELLENCE',
  },
  {
    template_key: 'distinction_template',
    template_name: 'Distinction Certificate (Champagne Gold & Onyx)',
    category: 'Distinction Certificate',
    primary_color: '#111111',
    secondary_color: '#E5C158',
    accent_color: '#333333',
    bg_gradient: 'linear-gradient(135deg, #FFFCF5 0%, #F7F1E1 100%)',
    border_style: 'gold-onyx-luxury',
    watermark_text: 'HIGHEST DISTINCTION',
    badge_title: 'DISTINCTION',
  },
  {
    template_key: 'internship_template',
    template_name: 'Internship Certificate (Corporate Slate)',
    category: 'Internship Certificate',
    primary_color: '#2B3A42',
    secondary_color: '#3F51B5',
    accent_color: '#4F6D7A',
    bg_gradient: 'linear-gradient(135deg, #F9FAFC 0%, #EEF2F6 100%)',
    border_style: 'corporate-slate-pillar',
    watermark_text: 'INTERNSHIP COMPLETED',
    badge_title: 'CORPORATE INTERNSHIP',
  },
  {
    template_key: 'workshop_template',
    template_name: 'Workshop Certificate (Emerald Green & Mint)',
    category: 'Workshop Certificate',
    primary_color: '#064E3B',
    secondary_color: '#10B981',
    accent_color: '#047857',
    bg_gradient: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
    border_style: 'emerald-leaf-frame',
    watermark_text: 'WORKSHOP PARTICIPANT',
    badge_title: 'TECHNICAL WORKSHOP',
  },
  {
    template_key: 'seminar_template',
    template_name: 'Seminar Certificate (Ruby Red & Coral)',
    category: 'Seminar Certificate',
    primary_color: '#881337',
    secondary_color: '#F43F5E',
    accent_color: '#BE123C',
    bg_gradient: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)',
    border_style: 'ruby-ribbon-border',
    watermark_text: 'SEMINAR DELEGATE',
    badge_title: 'SEMINAR CREDENTIAL',
  },
  {
    template_key: 'hackathon_template',
    template_name: 'Hackathon Certificate (Cyber Neon Purple)',
    category: 'Hackathon Certificate',
    primary_color: '#3B0764',
    secondary_color: '#A855F7',
    accent_color: '#7E22CE',
    bg_gradient: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)',
    border_style: 'cyber-neon-grid',
    watermark_text: 'HACKATHON WINNER',
    badge_title: 'INNOVATION HACKATHON',
  },
  {
    template_key: 'research_template',
    template_name: 'Research Participation (Midnight Blue)',
    category: 'Research Participation Certificate',
    primary_color: '#030712',
    secondary_color: '#2563EB',
    accent_color: '#1E40AF',
    bg_gradient: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
    border_style: 'academic-research-seal',
    watermark_text: 'RESEARCH CONTRIBUTOR',
    badge_title: 'RESEARCH PARTICIPATION',
  },
  {
    template_key: 'achievement_template',
    template_name: 'Achievement Certificate (Golden Amber)',
    category: 'Achievement Certificate',
    primary_color: '#78350F',
    secondary_color: '#F59E0B',
    accent_color: '#B45309',
    bg_gradient: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
    border_style: 'sunburst-gold-frame',
    watermark_text: 'OUTSTANDING ACHIEVEMENT',
    badge_title: 'ACHIEVEMENT AWARD',
  },
  {
    template_key: 'appreciation_template',
    template_name: 'Appreciation Certificate (Sunset Orange)',
    category: 'Appreciation Certificate',
    primary_color: '#7C2D12',
    secondary_color: '#EA580C',
    accent_color: '#C2410C',
    bg_gradient: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
    border_style: 'sunset-amber-ribbon',
    watermark_text: 'CERTIFICATE OF APPRECIATION',
    badge_title: 'APPRECIATION AWARD',
  },
];

function getAllPresets() {
  return TEMPLATE_PRESETS;
}

function getPresetByKey(key) {
  return TEMPLATE_PRESETS.find((t) => t.template_key === key) || TEMPLATE_PRESETS[0];
}

function getPresetByCategory(category) {
  return TEMPLATE_PRESETS.find((t) => t.category === category) || TEMPLATE_PRESETS[0];
}

module.exports = {
  TEMPLATE_PRESETS,
  getAllPresets,
  getPresetByKey,
  getPresetByCategory,
};
