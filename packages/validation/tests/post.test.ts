import { post } from "../src/post";

describe("post", () => {
    const valid_post = {
        type: "Article",
        title: "Hello World",
        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
        tags: ["tag1", "tag2", "tag3"],
        course: undefined as string | undefined
    };

    test("user new", () => {
        const result = post.parse(valid_post);
        expect(result).toEqual(valid_post);
    });

    test("partial update", () => {
        const result = post.partial().parse({
            content: valid_post.content
        });
        expect(result).toEqual({
            content: valid_post.content
        });
    });
});
