# Map and diagram rules

Every step draws the same map from `map.json`, rendered by
[`scripts/zoom-map.mjs`](scripts/zoom-map.mjs). The script owns the
coordinates, so the layout is identical at every step and only the frame
moves. Edit `map.json`; never hand-edit the rendered SVG.

## map.json

```json
{
  "title": "Link shortener",
  "nodes": [
    { "id": "browser", "label": "Browser", "note": "Person or bot", "col": 0, "row": 0, "kind": "external" },
    { "id": "api", "label": "Links API", "note": "Creates short links", "col": 1, "row": 0 },
    { "id": "db", "label": "Links table", "note": "Source of truth", "col": 1, "row": 1, "kind": "store" }
  ],
  "edges": [
    { "from": "browser", "to": "api", "label": "create" },
    { "from": "api", "to": "db" }
  ],
  "groups": [
    { "id": "write", "label": "Write path", "nodes": ["api", "db"] }
  ]
}
```

| Field | Rule |
| --- | --- |
| `nodes[].id` | Short and stable. Notes and steps refer to it. |
| `nodes[].label` | The name the code or the team uses, at most about 14 characters (11 with four columns). |
| `nodes[].note` | Optional. What the node does, at most 5 words. Add `planned` when it doesn't exist yet. |
| `nodes[].col`, `row` | Grid cell. Columns 0 to 3, rows from 0. One node per cell. |
| `nodes[].kind` | `service` (default), `store` (holds data, drawn teal) or `external` (outside the system, dashed; it gets no level 3 step). |
| `edges[]` | `from` and `to` node ids. Optional `label` (at most 2 words), `both: true` for two-way, `dashed: true` for async or optional. |
| `groups[]` | The sub-systems, in teaching order. A node belongs to at most one group. Every node that isn't `external` belongs to one. |

Steps come from the map: `1`, then `2.n` for each group in order, then `3.n`
for each grouped node in group order. `zoom-map.mjs check` lists them.

## Laying out the map

- **Pick groups by responsibility**: what one part of the system owns or
  decides, such as the write path, the read path, storage, or the worker.
  Teaching order follows a real request: where it enters, then where it goes
  next.
- **Each group is a rectangle of cells** with no other node inside it, because
  the frame is drawn around the group's bounding box. `check` fails when a
  frame would include a node from another group.
- **Lay the main flow left to right or top to bottom**, with the entry point
  top left. Put stores below or beside the service that writes them.
- **Arrows follow empty columns and gaps.** When `check` reports that an edge
  has no clear path, move a node so the column between the two ends is empty.
- **Fix every warning**: a label that overflows its box, or a map over 12
  nodes (split part of it into a child map).
- **Look at level 1 before teaching.** Arrows that share a gap run in
  parallel lanes, and an edge label can land on a neighbouring lane. Drop that
  label, or move a node so the arrows stop sharing the gap.

## Drawing in chat

Draw each step as an inline diagram, so the user sees a picture instead of
code.

- **With an inline SVG tool** (such as `show_widget`): pass the output of
  `zoom-map.mjs step <map.json> <id>` as the widget code, unchanged. Clicking
  a node in it asks to jump to that node's step. For `map` or `tour`, pass the
  output of `zoom-map.mjs tour <map.json>`: one stepper with every frame and
  a button that asks you to teach the step on screen.
- **Without one**: run `zoom-map.mjs save`, then tell the user to open
  `~/growth/systems/<slug>/map.html#<step id>` in a browser. Add the Mermaid
  copy only where the chat renders Mermaid; elsewhere it shows as raw code.

Write the explanation in your message, outside the diagram. One diagram per
step: the map is the only picture, so the user never has to match two
layouts. When a node needs a sequence or a state diagram at level 3, draw it
as a second diagram after the map, and label it as a detail of that node.

## Saved copies

`zoom-map.mjs save <map.json> <dir>` writes:

- `map.html`: a page that steps through every frame, with arrow keys and
  `#<step id>` links. It works offline.
- `map.svg`: level 1, for a pull request, a doc or a slide.

`zoom-map.mjs mermaid <map.json>` prints a Mermaid copy, with sub-systems as
subgraphs, for the notes file.
