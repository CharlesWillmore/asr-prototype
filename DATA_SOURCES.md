# Registry listing prototype — 23 September 2026

## Content provenance

`data/registry-records.js` contains 18 public Registry records, with a source URL on every record. Descriptions are copied from each record's Description field, with cell-line identifiers prefixed as described below. Missing descriptions and person contacts are left missing. The listing is a local snapshot of these 18 examples, not a connection to the complete live database; displayed counts refer to this sample.

Cell-line identifiers use the lowercase `aus` prefix throughout the prototype, as requested on 29 September 2026 (for example `ausMCRIi035-B`). This applies to listing data, detail pages, related-line references and JSON export. External source URLs retain their original spelling. The ausMCRIi035-B-1 listing link opens the local detail page; other records link to their corresponding live Registry pages.

Alternative names are split on semicolons. The maintainer's affiliated institution is preferred for the contact line; the producer institution is used when no maintainer affiliation exists. An organisational maintainer is not presented as a person's name. Cities in the recorded affiliations determine states. Unknown hierarchy levels are skipped. The Centre for Stem Cell Systems / Wells Laboratory branch uses the hierarchy supplied by Charles for Christine Wells; it still requires the Registry's definitive organisation export.

Variant origins are a prototype interpretation of the public genotype, donor disease and genomic-modification fields: a documented introduced modification supplies In Vitro; a reported donor disease with genotype supplies Donor. ausMCRIi035-B-1 retains a donor TRAPPC4 variant and has an isogenic modification, providing the two-line example. No reported genotype/modification displays an en dash. Gene checkboxes use the genotype locus with those origins. The production export should provide explicit variant origin per locus rather than infer it from these public display fields.

## Variant hierarchy

The Variant filter follows Suzy's **Variant_Listing_B.png**: None reported; Donor origin → gene; Modification → Isogenic modification / Gene knock in / Transgene expression / Gene knock out → gene. It reuses the Disease tree controls, counts, category selection and partial-selection state. Gene keys remain specific to their origin and modification type, so selecting donor TRAPPC4 does not also select its isogenic modification.

Explicit `modifications` entries were checked against the public Registry's Mutation Type fields on 28 September 2026: ausMCRIi035-B-1 (704), ausMCRIi001-A-3 (537), ausMCRIi001-A-4 (398), and ausMCRIi001-B (604) are isogenic modifications; ausWAe009-A-3H (770) is Gene Knock-out. Each record retains its source URL. Donor assignments retain the existing snapshot interpretation described above. The diagram's GENE A–Z labels are illustrative, not sample data. Gene knock in and Transgene expression remain visible with zero counts because this 18-record sample has no explicitly recorded examples; inherited reporter modifications are not inferred. None reported means no variant recorded in this snapshot, not confirmed absence of genetic variation.

## Disease hierarchy

`data/disease-tree.js` transcribes Andrew's supplied **Disease Tree - Flatten at 10 - No merge variants.txt** (updated in the prototype on 28 September 2026). The N=10 flattened hierarchy preserves the supplied order and exact disease endpoints without merging variants or restoring extra intermediate categories. It contains 53 distinct diseases, 12 top-level groups (including Other), and a maximum of five levels beneath the Disease heading. Disease selections synchronise across repeated appearances in multiple branches; result counts count distinct cell lines in the local sample, rather than copying the source listing's full-registry counts.

The hierarchy remains provisional, not a final clinical classification. Diseases present in the newer public snapshot but missing from Andrew's tree are placed in Other pending the revised export. The audit's existing Other placement is retained. We do not infer clinical ancestry or silently apply Suzy's proposed ontology corrections. The current tree retains zero-count categories to show the scope and depth of Andrew's audit, while counts reflect only the 18 sample records.

Disease and category display labels capitalise their first letter while retaining the original matching keys. The Has Disease yes/no options now appear as an expandable branch immediately after Other in the Disease filter; their existing filtering logic is retained.

## Interaction decisions

- Default: six columns. Open filter: Identifier / Description / Cell Line Contact.
- Checkbox selections filter immediately; OR within a section, AND across sections.
- Category selection includes all descendants; partial selection displays an indeterminate checkbox. Disease guidance appears before and after All Diseases and explains linked selections and the partial-selection dash. Disease expansion arrows have separate 32px targets; selecting a category does not expand it.
- Apply, close and Escape retain all selections. Apply changes layout, not the matching set.
- Clear removes selections and text search but preserves expanded branches.
- Description preview: at most 230 characters before the ellipsis, ending at a word boundary. More/less acts independently per record.
- The filter uses its standard width; the optional Expand filter control and widening behaviour have been removed.
- Below 1200px the filter is an overlay. Results and filter scroll separately at desktop sizes.
- The record page's body and legacy filter are deferred; only the shared black header and supplied SVG were changed there.

## ausMCRIi035-B-1 detail prototype
`cell-line-704.html` uses the public Registry record at https://ausstemcellregistry.org.au/stem_cell/cell_line/704/ (snapshot 23 September 2026). Unrecorded fields remain explicitly unrecorded. The legacy cell-line-395 page is retained separately. The selected listing row opens the new local detail page.

Icons are from IBM Carbon's official `packages/icons/src/svg/32` sources: chemistry, certificate--check, user--access, information, share, document--pdf and JSON. Source: https://github.com/carbon-design-system/carbon. Apache 2.0 licence is retained in `assets/CARBON-LICENSE.txt`. Registry symbol extracted from the supplied outlined logo.

PDF action opens the browser print dialog (Save as PDF); JSON exports the listing snapshot for this record, not a full Registry API response. The horizontal slider scrubs the entire record; five independently clickable group links jump to their corresponding headings.

Cell-page navigation now separates Overview from Derivation (Source, Derivation and Genomic Modifications / Growth Characteristics), followed by Characterisation, Accessibility and Additional Info. Overview reuses the existing information icon; Derivation uses the supplied Issue C How-made.svg; Additional Info uses an open-book pictogram.


## Home page — 30 September 2026
`home.html` implements the supplied Issue A home-page and slider PDF layouts using supplied images from 08_Home_Sliders and 09_Tiles. The map SVG retains only the original visible map path, removing off-canvas Illustrator material. Slider text remains live HTML; rotation is manual. The research-group figure is supplied draft copy and remains to be confirmed. Registry totals are omitted because the listing is a sample. Top 20 bars are decorative, not data. Unbuilt destinations open a placeholder dialog; the footer is provisional. Search links open the existing listing and relevant filter section. Header navigation uses Home instead of Cell Lines.


## Filter summary and demonstration volume — 1 October 2026
The listing repeats the 18 source records to produce 300 demonstration rows; these are not 300 distinct registry entries. Identifiers and source links retain their original values; each repeated row has an independent internal key. Counts and pagination refer to demonstration rows.
Summaries describe the actual query and selected filter paths, collapse the entire description to 75 Unicode characters, and reveal the rest with more/less. First-time filter entry hides the summary until the detailed listing or a record has been viewed. Edits then show a live count and more only; returning after viewing the listing shows the capped description. Session storage preserves selections, search, pagination and review state for return links. Detail pages omit search summaries and provide return-to-filter and return-to-listing links; the redesigned record retains its existing sticky identity/navigation group.

## Alternative cell-line navigation pages — 1 October 2026

- `cell-line-537.html`: ausMCRIi001-A-3, circular icon navigation (first design in Alternative sliders.pdf). Source: https://ausstemcellregistry.org.au/stem_cell/cell_line/537/
- `cell-line-770.html`: ausWAe009-A-3H, boxed text navigation (second design). Source: https://ausstemcellregistry.org.au/stem_cell/cell_line/770/
- Details transcribed from both public records on 1 October 2026; unavailable fields remain explicitly unrecorded. Duplicate DOI entries in record 537 are presented once. Cell-line display identifiers receive the prototype `aus` prefix; original publication titles and external URLs are retained.
- Record 770's source description calls the line induced pluripotent, but its derivation section and publication describe embryonic derivation. Source wording is preserved, pending registry clarification. Its disease field is empty although the description mentions Barth syndrome.
- Existing 300 repeated listing entries are retained, with these two identifiers now linking to their local pages. JSON downloads use the selected line's existing prototype data record.
