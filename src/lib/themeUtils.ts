import { SectionSettings, SectionType, SiteSection } from '../types/cms';
import { DEFAULT_SECTIONS, SECTION_REGISTRY } from './sectionRegistry';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidSectionType(type: unknown): type is SectionType {
  return typeof type === 'string' && Object.prototype.hasOwnProperty.call(SECTION_REGISTRY, type);
}

function createDefaultStaticSection(type: 'header' | 'copyright'): SiteSection {
  const fromDefaults = DEFAULT_SECTIONS.find((s) => s.type === type);
  if (fromDefaults) {
    return {
      ...fromDefaults,
      draft_settings: { ...fromDefaults.draft_settings },
      published_settings: { ...fromDefaults.published_settings },
    };
  }

  const def = SECTION_REGISTRY[type];
  return {
    id: `default-${type}`,
    type,
    nav_label: def.defaultNavLabel,
    anchor_id: def.defaultAnchorId,
    show_in_nav: false,
    is_visible: true,
    sort_order: 0,
    draft_settings: { ...def.defaultSettings },
    published_settings: { ...def.defaultSettings },
    has_unpublished_changes: false,
  };
}

function normalizeSection(raw: Partial<SiteSection> & { settings?: unknown }): SiteSection {
  const type = raw.type as SectionType;
  const def = SECTION_REGISTRY[type];

  const legacySettings: SectionSettings = isPlainObject(raw.settings)
    ? { ...raw.settings }
    : {};
  const existingDraft: SectionSettings = isPlainObject(raw.draft_settings)
    ? { ...raw.draft_settings }
    : {};
  const existingPublished: SectionSettings = isPlainObject(raw.published_settings)
    ? { ...raw.published_settings }
    : {};

  const draft_settings: SectionSettings =
    Object.keys(existingDraft).length > 0
      ? existingDraft
      : Object.keys(legacySettings).length > 0
        ? legacySettings
        : { ...def.defaultSettings };

  const published_settings: SectionSettings =
    Object.keys(existingPublished).length > 0
      ? existingPublished
      : Object.keys(draft_settings).length > 0
        ? { ...draft_settings }
        : {};

  return {
    id:
      typeof raw.id === 'string' && raw.id.trim().length > 0
        ? raw.id
        : `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    nav_label:
      typeof raw.nav_label === 'string' && raw.nav_label.trim().length > 0
        ? raw.nav_label
        : def.defaultNavLabel,
    anchor_id:
      typeof raw.anchor_id === 'string' && raw.anchor_id.trim().length > 0
        ? raw.anchor_id
        : def.defaultAnchorId,
    show_in_nav: def.isStatic
      ? false
      : typeof raw.show_in_nav === 'boolean'
        ? raw.show_in_nav
        : true,
    is_visible: typeof raw.is_visible === 'boolean' ? raw.is_visible : true,
    sort_order: typeof raw.sort_order === 'number' ? raw.sort_order : 0,
    draft_settings,
    published_settings,
    has_unpublished_changes:
      typeof raw.has_unpublished_changes === 'boolean'
        ? raw.has_unpublished_changes
        : false,
    ...(raw.created_at ? { created_at: raw.created_at } : {}),
    ...(raw.updated_at ? { updated_at: raw.updated_at } : {}),
  };
}

/**
 * Normalizes a list of theme sections:
 * - Filters out unknown section types not present in SECTION_REGISTRY
 * - Ensures draft_settings and published_settings are populated
 * - Keeps static `header` first and static `copyright` last with sequential sort_order
 */
export function normalizeThemeSections(rawSections: SiteSection[]): SiteSection[] {
  const safeSections = Array.isArray(rawSections) ? rawSections : [];

  const validNormalized = safeSections
    .filter(
      (section): section is SiteSection =>
        isPlainObject(section) && isValidSectionType(section.type)
    )
    .map((section) => normalizeSection(section));

  const headerSection =
    validNormalized.find((s) => s.type === 'header') ??
    createDefaultStaticSection('header');
  const copyrightSection =
    validNormalized.find((s) => s.type === 'copyright') ??
    createDefaultStaticSection('copyright');
  const middleSections = validNormalized.filter(
    (s) => s.type !== 'header' && s.type !== 'copyright'
  );

  return [headerSection, ...middleSections, copyrightSection].map((section, index) => ({
    ...section,
    sort_order: index,
  }));
}

/**
 * Parses and validates an imported theme JSON string.
 * Throws a descriptive Error if the JSON is invalid, lacks sections, or contains no valid section types.
 */
export function parseAndValidateThemeJson(
  rawText: string,
  fallbackName: string
): { name: string; sections: SiteSection[] } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error('Invalid JSON file. Please check the file contents and try again.');
  }

  if (!isPlainObject(parsed)) {
    throw new Error('Invalid theme JSON: root value must be a JSON object.');
  }

  if (!Array.isArray(parsed.sections) || parsed.sections.length === 0) {
    throw new Error('Invalid theme JSON: "sections" must be a non-empty array.');
  }

  const validRawSections = parsed.sections.filter(
    (section): section is SiteSection =>
      isPlainObject(section) && isValidSectionType(section.type)
  );

  if (validRawSections.length === 0) {
    throw new Error(
      'Invalid theme JSON: no valid section types found in "sections".'
    );
  }

  const rawName = typeof parsed.name === 'string' ? parsed.name.trim() : '';
  const name = rawName.length > 0 ? rawName : fallbackName.trim() || 'Imported Theme';

  return {
    name,
    sections: normalizeThemeSections(validRawSections),
  };
}
