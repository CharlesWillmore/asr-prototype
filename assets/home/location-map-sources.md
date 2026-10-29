# Location map sources

## Artwork and animation geometry

The original 35 pale circle paths are extracted directly from page 1 of Charles's ASR_Map_A1.pdf, supplied 29 October 2026. Their cubic Bezier coordinates and translations are preserved in assets/home/location-map.svg and the inline SVG in home.html. The 1364.97 × 800 coordinate system scales uniformly on screen.

Dark-dot centres and complete connector routes in data/location-map-layout.js come directly from pages 2–8: Victoria, Overseas, Western Australia, Tasmania, South Australia, Queensland, New South Wales. The marker radius includes the original stroke. NSW uses the additional eighth page supplied by Charles.

The desktop box starts at the PDF's x=856.0791, y=197.723. Its content determines its height, allowing the full institution list. Heading/intro and panel content remain HTML. On phones the same map scales uniformly and the panel follows below it.

## Interaction regions

Geographic hit areas: https://static.geodataviewer.com/datasets/australia-states.geojson downloaded 29 October 2026. Metadata: https://geodataviewer.com/datasets/boundaries/australia-states-boundaries/ . ABS ASGS Edition 3, 2021, simplified approximately 1 km; CC BY 4.0. Other Territories excluded; ACT retained. These invisible regions are fitted over the stylised symbol; the actual artwork is unchanged.

Northern Territory selects South Australia. ACT selects Victoria. The base region buttons are removed. SVG regions remain focusable and respond to keyboard and touch.

## Institutions and counts

Institution names come from the generator institute chart on page 2 of 2026_10_21_front_page_plots.pdf, grouped by state and overseas as reviewed in the chat. Separate subinstitutions are retained, including Cord Blood Advanced Therapies Research Laboratory. The Florey Institute and University of Melbourne are separate institutions.

Counts use exact institution-name matches in window.registryRecords (punctuation/case normalized), not estimates from bar lengths or the layout's placeholder 34. Institution links use the actual snapshot so counts agree with filtered results. Institutions absent from the snapshot show 0 and lead to empty results.

South Australia and Northern Territory have no entries in the supplied institution list. No institutions are invented for these regions.
