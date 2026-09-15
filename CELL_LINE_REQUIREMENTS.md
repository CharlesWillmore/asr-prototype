# Cell line prototype requirements and open questions

This register reconciles the annotated PDF, the Word comments from Suzy Butcher and Christine Wells, and the meeting decision supplied by Charles. Document comments are review evidence; Charles's direct instructions take precedence.

## Confirmed and implemented in the first tranche

- Use 11 indexed sections: Overview, Source, Derivation, Genomic Modifications, Growth Characteristics, Quality Assurance, Custodianship, Ethics, Related Cell Lines, Associated Publications, and External References.
- Put the section index in a sticky horizontal bar and include next-section links.
- Keep the cell line identifier at 32 px.
- Put contact, institution, and producer information with the identifier; retain the full Custodianship section.
- Replace the QR-code concept with a working “Share this page” action.
- Show prototype actions for PDF and JSON downloads. These remain disabled until export behaviour is designed.
- Keep biopsy location in Overview and show tissue of origin alongside it.
- Make ontology information available through a link that opens in a new tab.
- Include Donor in Source; allow Parental Cell Line as an optional future subsection.
- Add derivation fields for feeder cells, xeno-free conditions, GMP, clonality, and selection method.
- Break genomic modification data into repeatable variant fields: zygosity, coding variant, protein variant, ClinVar, and dbSNP. Use roman text.
- Add ROCK inhibitor use to Growth Characteristics.
- Use the heading “Microbiology and Virology Screening” and roman summary text.
- Present marker results as a table and use expandable Quality Assurance subsections.
- Use four pluripotency groups: Endoderm, Mesoderm, Ectoderm, and Other. Repeated Other results can expand individually.
- Show the institution website on the Cell Line page and explain separately when a link returns a filtered list.
- Show related line identifiers and the nature of each relationship.
- Put article title first. The original reference publication should appear first, followed by newer publications ordered by year. A future list can show 10 before “Show more”.
- Do not implement alphabetical pagination. Search and filters are the agreed way to find a record.

## Outstanding answers or dependencies

1. **Derivation image:** Suzy said she would assemble examples for pages that need images. No image, caption, placement rule, or intended user task has been supplied.
2. **Genomic characterisation images:** The number of images, whether images repeat with instances, and their relationship to the text remain unanswered.
3. **Marker images:** Suzy described likely material (photographs, plots, or a complete panel), but no assets, required dimensions, captions, or image-to-result mapping have been supplied.
4. **Scorecard images:** The purpose is clearer (showing expression strength behind the summary), but no reusable images or results PDF has been supplied. The interface cannot test a modal or download treatment yet.
5. **Pluripotency scale:** Four category names are confirmed, and “Other” can repeat many times, but no representative high-volume dataset or marker images have been supplied to validate expansion behaviour.
6. **Download actions:** PDF and JSON were considered useful, but no content scope, file format specification, generation method, or download naming convention was decided.
7. **Review notification:** “Email me when the line has been reviewed” was considered useful, but subscription, consent, confirmation, and notification behaviour are unspecified.
8. **Source examples:** The bold-label/detail pattern was accepted, but representative examples for optional Parental Cell Line and multi-disease/multi-variant cases have not been supplied.
9. **Direct person links:** ORCID was suggested for a later version. Which contacts have permission and identifiers is unknown, so person links are not implemented.
10. **External related lines:** The question of including overseas related lines and linking to hPSCreg or Cellosaurus was not answered.
11. **Section consolidation:** Several possible groups were discussed, but no final names or grouping decision was made. The prototype retains all 11 sections in a horizontal index.
12. **Stemformatics:** The location and purpose of a Stemformatics link remain undecided.
13. **Disease information treatment:** Opening ontology information externally was accepted conditionally, while Christine preferred keeping users on-site. Automatic summaries or previews require a data source and a final product decision.
14. **Exact record content:** Some values in the current page are prototype examples based on supplied screen grabs and comments. They need validation against Registry data before production use.

## Deferred listing-page decisions

- Alphabetical pagination is closed and will not be implemented.
- Reporting by facility was requested, but report content, date controls, charts, and export format remain undefined.
- Disease capitalization still needs an editorial rule: ontology capitalization or a Registry house style.
- Search-result cards and columns were broadly agreed, but the current task focuses on the Cell Line page.
