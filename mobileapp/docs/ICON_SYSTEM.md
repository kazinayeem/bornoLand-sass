# BornoLand mobile icon system

## Standard

- Library: `lucide-react-native` only.
- Native renderer: Expo SDK 57 compatible `react-native-svg` 15.15.4.
- Default stroke: `2`; dense metadata: `1.8`; selected navigation: `2.2`.
- Default sizes: `16` inline, `18` compact action, `20` navigation/list, `22` primary action, `24` feature card.
- Use `absoluteStrokeWidth` so scale changes do not alter perceived weight.
- Interactive icon containers are at least `44 × 44` points.
- Inactive color: semantic `textSoft`; active color: semantic `primary`.
- Selected navigation scale: `1.06`; animation uses the shared fast/standard motion tokens and honors Reduce Motion.
- Icons are decorative when an adjacent visible label exists. Icon-only controls require a precise accessibility label.
- Do not use emoji, Unicode pictograms, filled icons from another family, or generic fallback glyphs.

## Semantic navigation map

| Semantic name | Lucide component |
|---|---|
| dashboard | `LayoutDashboard` |
| stores/store | `Store` |
| products | `Package` |
| orders | `ShoppingBag` |
| customers | `Users` |
| categories | `Shapes` |
| inventory | `Boxes` |
| coupons | `TicketPercent` |
| CMS | `FileText` |
| pages | `Files` |
| media | `Images` |
| builder | `WandSparkles` |
| theme | `Palette` |
| analytics | `ChartNoAxesCombined` |
| marketing | `Megaphone` |
| apps | `Blocks` |
| reports | `ChartColumnBig` |
| branding | `BadgeCheck` |
| domain | `Globe2` |
| SEO/search | `Search` |
| settings | `Settings` |
| activity | `Activity` |
| billing | `CreditCard` |
| subscription | `Crown` |
| notifications | `Bell` |
| profile | `UserRound` |
| security | `ShieldCheck` |
| help | `CircleHelp` |
| more | `Ellipsis` |
| cart | `ShoppingCart` |
| wishlist | `Heart` |

## Semantic action map

| Action | Lucide component |
|---|---|
| create/add | `Plus` |
| edit/rename | `Pencil` |
| delete | `Trash2` |
| duplicate | `Copy` |
| share | `Share2` |
| copy URL | `Link2` / `Copy` |
| download | `Download` |
| upload | `Upload` |
| import | `FileInput` |
| filter | `SlidersHorizontal` |
| sort | `ArrowUpDown` |
| refresh | `RefreshCw` |
| save | `Save` |
| publish | `Rocket` |
| preview | `Eye` |
| archive | `Archive` |
| restore | `ArchiveRestore` |
| back | `ArrowLeft` |
| forward | `ArrowRight` |
| next/detail | `ChevronRight` |
| close | `X` |
| selected/success | `Check` / `CircleCheck` |
| warning | `TriangleAlert` |
| error | `CircleAlert` |
| logout | `LogOut` |

## Implementation boundary

The current environment could not download `lucide-react-native`; its approval service returned an organization-verification error. The dependency was not faked and no unresolved import was committed. Once installation is approved and succeeds, the existing `Icon` API will be backed by explicitly imported Lucide components from this map, avoiding a wildcard catalog import and its bundle-size cost.
