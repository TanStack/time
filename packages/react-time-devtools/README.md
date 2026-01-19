# TanStack Time

A complete time for creating new TanStack libraries with all the tooling and infrastructure you need.

## What's Included

- ✅ Framework-agnostic core package
- ✅ React and Solid adapters (easy to add more)
- ✅ Devtools packages for debugging
- ✅ Full monorepo setup with pnpm + Nx
- ✅ TypeScript configuration
- ✅ Testing setup with Vitest
- ✅ Documentation structure with TypeDoc
- ✅ Example applications
- ✅ GitHub workflows (CI, release, autofix)
- ✅ Changesets for versioning
- ✅ ESLint + Prettier
- ✅ Issue and PR times

## Getting Started

1. Clone or copy this time
2. Follow the instructions in time_GUIDE.md
3. Search and replace "time" with your library name
4. Replace placeholder code with your implementation
5. Update documentation
6. Start building!

## Package Structure

- `@tanstack/time` - Core library
- `@tanstack/react-time` - React adapter
- `@tanstack/solid-time` - Solid adapter
- `@tanstack/time-devtools` - Base devtools
- `@tanstack/react-time-devtools` - React devtools
- `@tanstack/solid-time-devtools` - Solid devtools

## Commands

```bash
pnpm install          # Install dependencies
pnpm build:all        # Build all packages
pnpm test:lib         # Run tests
pnpm test:pr          # Run PR checks
pnpm format           # Format code
pnpm generate-docs    # Generate documentation
pnpm watch            # Watch mode
```

## Documentation

See time_GUIDE.md for detailed instructions on customizing this time.

## License

MIT
