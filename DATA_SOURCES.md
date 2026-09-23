# Registry listing prototype — 23 September 2026

## Content provenance

`data/registry-records.js` contains 18 public Registry records, with a source URL on every record. Descriptions are copied from each record's Description field. Missing descriptions and person contacts are left missing. The listing is a local snapshot of these 18 examples, not a connection to the complete live database; displayed counts refer to this sample.

Identifiers use the live Registry spelling (for example MCRIi035-B, not an invented `aus` prefix). The earlier local detail-page mockup remains unchanged apart from the header/logo. Listing identifier links open the corresponding real Registry record in a new tab, rather than linking different records to that same mockup.

Alternative names are split on semicolons. The maintainer's affiliated institution is preferred for the contact line; the producer institution is used when no maintainer affiliation exists. An organisational maintainer is not presented as a person's name. Cities in the recorded affiliations determine states. Unknown hierarchy levels are skipped. The Centre for Stem Cell Systems / Wells Laboratory branch uses the hierarchy supplied by Charles for Christine Wells; it still requires the Registry's definitive organisation export.

Variant origins are a prototype interpretation of the public genotype, donor disease and genomic-modification fields: a documented introduced modification supplies In Vitro; a reported donor disease with genotype supplies Donor. MCRIi035-B-1 retains a donor TRAPPC4 variant and has an isogenic modification, providing the two-line example. No reported genotype/modification displays an en dash. Gene checkboxes use the genotype locus with those origins. The production export should provide explicit variant origin per locus rather than infer it from these public display fields.

## Disease hierarchy

`data/disease-tree.js` transcribes the N=10 simplified tree in Andrew's supplied **Disease ontology tree simplification - Stem Cell Registry Data Extra.txt**. Folded disease endpoints are restored from named descendant endpoints in the raw tree in that same file. The generic disease remains selectable alongside its descendants. Disease selections synchronise across repeated appearances in multiple branches; result counts count distinct cell lines.

The hierarchy remains provisional, not a final clinical classification. Diseases present in the newer public snapshot but missing from Andrew's tree are placed in Other pending the revised export. The audit's existing Other placement is retained. We do not infer clinical ancestry or silently apply Suzy's proposed ontology corrections. The current tree retains zero-count categories to show the scope and depth of Andrew's audit, while counts reflect only the 18 sample records.

## Interaction decisions

- Default: six columns. Open filter: Identifier / Description / Cell Line Contact.
- Checkbox selections filter immediately; OR within a section, AND across sections.
- Category selection includes all descendants; partial selection displays an indeterminate checkbox.
- Apply, close and Escape retain all selections. Apply changes layout, not the matching set.
- Clear removes selections and text search but preserves expanded branches.
- Description preview: at most 230 characters before the ellipsis, ending at a word boundary. More/less acts independently per record.
- Explicit Expand filter widens the panel. Contact disappears first; Description disappears when insufficient width remains; the matching count stays visible if the results pane cannot fit.
- Below 1200px the filter is an overlay. Results and filter scroll separately at desktop sizes.
- The record page's body and legacy filter are deferred; only the shared black header and supplied SVG were changed there.

## MCRIi035-B-1 detail prototype
`cell-line-704.html` uses the public Registry record at https://ausstemcellregistry.org.au/stem_cell/cell_line/704/ (snapshot 23 September 2026). Unrecorded fields remain explicitly unrecorded. The legacy cell-line-395 page is retained separately. The selected listing row opens the new local detail page.

Icons are from IBM Carbon's official `packages/icons/src/svg/32` sources: chemistry, certificate--check, user--access, information, share, document--pdf and JSON. Source: https://github.com/carbon-design-system/carbon. Apache 2.0 licence is retained in `assets/CARBON-LICENSE.txt`. Registry symbol extracted from the supplied outlined logo.

PDF action opens the browser print dialog (Save as PDF); JSON exports the listing snapshot for this record, not a full Registry API response. The horizontal slider scrubs the entire record; four independently clickable group links jump to their corresponding headings.
