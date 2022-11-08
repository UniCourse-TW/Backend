# Course Pack

Course Pack is a serialized collection of courses, instructors, programs, and providers.

> Course Pack is the official supported data source format of UniCourse.

## Format

You can find the format specification [here](https://esm.sh/course-pack/schema.json) (JSON Schema).

### Subtypes

Course Pack has two subtypes: _Frozen Course Pack_ and _Extendable Course Pack_.

A Course Pack is _Frozen_ if all of the id-like fields are CUIDs, which makes the data immutable and interchangeable with UniCourse database.

If a Course Pack is not _Frozen_, we call it _Extendable_, which takes the advantage of the flexibility of custom id formats and can be easily merged with other Course Packs in the same convention.

## Verify Course Pack

You can use `verify` function to type-safe verify a Course Pack.

```ts
import fs from "node:fs";
import type { CoursePack } from "course-pack";
import { verify } from "course-pack";

const pack: unknown = JSON.parse(fs.readFileSync("course-pack.json", "utf-8"));
try {
    const verified: CoursePack = verify(pack);
    console.log(verified);
} catch (error) {
    console.error(error);
}
```
