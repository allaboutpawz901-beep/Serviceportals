#!/usr/bin/env python3
"""Replace remaining dark-chrome tokens (sidebar/topbar) with background/accent tokens.
Idempotent: each pair reports how many replacements were made."""

import pathlib

SIDEBAR = pathlib.Path('/home/z/my-project/src/components/pawz/Sidebar.tsx')
HEADER = pathlib.Path('/home/z/my-project/src/components/pawz/Header.tsx')

SIDEBAR_PAIRS = [
    # navButtonClass focus ring
    ("focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar",
     "focus-visible:ring-offset-1 focus-visible:ring-offset-background"),
    # navButtonClass active/inactive
    ("? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'",
     "? 'bg-accent text-accent-foreground font-medium'"),
    (": 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'",
     ": 'text-foreground/80 hover:bg-accent hover:text-foreground'"),
    # mobile backdrop malformed arbitrary opacity
    ("bg-foreground/[0-9]0 backdrop-blur-xs",
     "bg-foreground/10 backdrop-blur-xs"),
    # brand title
    ('tracking-tight text-sidebar-foreground">',
     'tracking-tight text-foreground">'),
    # brand subtitle
    ('mt-1 text-[10px] font-medium text-sidebar-foreground/60',
     'mt-1 text-[10px] font-medium text-muted-foreground'),
    # mobile close button
    ("rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer",
     "rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"),
    # nav container
    ('custom-scrollbar flex-1 overflow-y-hidden py-2 text-sidebar-foreground',
     'custom-scrollbar flex-1 overflow-y-hidden py-2 text-foreground'),
    # category label
    ("tracking-wider text-sidebar-foreground/50 transition-colors hover:text-sidebar-foreground/80 cursor-pointer",
     "tracking-wider text-muted-foreground transition-colors hover:text-foreground cursor-pointer"),
    # item icon active/inactive
    ("? 'text-sidebar-accent-foreground'\n                              : 'text-sidebar-foreground/70 group-hover/item:text-sidebar-accent-foreground'",
     "? 'text-accent-foreground'\n                              : 'text-muted-foreground group-hover/item:text-foreground'"),
]

HEADER_PAIRS = [
    # avatar/user dropdown trigger button
    ("rounded-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-9 pr-2 pl-1 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-topbar",
     "rounded-full hover:bg-accent hover:text-accent-foreground h-9 pr-2 pl-1 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"),
    # user name label next to avatar
    ('<span className="hidden md:inline text-[13px] font-medium text-topbar-foreground">',
     '<span className="hidden md:inline text-[13px] font-medium text-foreground">'),
]


def apply(path: pathlib.Path, pairs) -> None:
    text = path.read_text()
    print(f'--- {path.name} ---')
    for old, new in pairs:
        n = text.count(old)
        if n:
            text = text.replace(old, new)
        print(f'  [{n}] {old[:60]!r}')
    path.write_text(text)


apply(SIDEBAR, SIDEBAR_PAIRS)
apply(HEADER, HEADER_PAIRS)

# Final verification: no stale chrome tokens left in the shell files
leftover = []
for path in (SIDEBAR, HEADER):
    for i, line in enumerate(path.read_text().splitlines(), 1):
        if any(t in line for t in ('bg-topbar', 'bg-sidebar', 'text-topbar-', 'text-sidebar-',
                                   'ring-offset-topbar', 'ring-offset-sidebar', '[0-9]0')):
            leftover.append(f'{path.name}:{i}: {line.strip()[:90]}')
print('--- leftover old tokens ---')
print('\n'.join(leftover) if leftover else 'NONE — clean')
