<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep React providers in component-only TSX modules and contexts, query hooks, types, and messaging utilities in non-component modules so Fast Refresh boundaries stay stable.
- Resolve known legacy product image paths to imported asset-pointer URLs when loading products, preserving custom admin URLs and avoiding stale database paths replacing working placeholder images.
