# UniCourse Course Search

This is the course search module for UniCourse.

**This is an internal package, if you don't know what this is, you probably don't need it.**

The default course search supports the following advanced search keywords:

- `teacher:someone`
- `program:something`
- `year:someyear`
- `term:someterm`

`key=value`, `key="more value"` syntax is also supported.

Other wild keywords will be treated as a search for course name or exact course code.

The expected result order is the relevance on name and description.
