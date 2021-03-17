export default {

    Query: {
        get: async (parent, {key}, {redis}) => {
            try {
                const response = await redis.hgetall(key);
                return await getPost(response, redis);
            } catch (error) {
                console.log(error);
                return null
            }
        },
        posts: async (parent, {key}, {redis, posts}) => {
            try {
                const keys = await posts.keys('post:*');
                const pipeline = redis.pipeline();
                keys.forEach(key => pipeline.hgetall(key));
                const values = await pipeline.exec();
                const mappedValues = values.map(value => value[1]);
                for (let post of mappedValues) {
                    // Use this if you want to retrieved all related content.
                    /*post = await getPost(post, redis);*/
                    post.postContent = JSON.parse(post.postContent);
                }
                return mappedValues.slice(0, 100);;
            } catch (error) {
                console.log(error);
                return null
            }
        }
    },
}

const getPost = async (post, redis) => {
    const postContentIds = await redis.hgetall('content:' + post.postId);
    const ids = [];
    for (const [key, id] of Object.entries(postContentIds)) {
        ids.push(id);
    }
    const pipeline = redis.pipeline();
    ids.forEach(key => pipeline.hgetall("block:" + key));
    const postContent = await pipeline.exec();

    const pipelineAttrs = redis.pipeline();
    ids.forEach(key => pipelineAttrs.hgetall("blockattrs:" + key));
    const attrs = await pipelineAttrs.exec();

    const mappedCategoryIds = await redis.hgetall('categories:' + post.postId);
    const categoryIds = [];
    for (const [key, id] of Object.entries(mappedCategoryIds)) {
        categoryIds.push(id);
    }
    const categoriesPipeline = redis.pipeline();
    categoryIds.forEach(key => categoriesPipeline.hgetall("category:" + key));
    const categories = await categoriesPipeline.exec();

    const mappedTagIds = await redis.hgetall('tags:' + post.postId);
    const tagIds = [];
    for (const [key, id] of Object.entries(mappedTagIds)) {
        tagIds.push(id);
    }
    const tagsPipeline = redis.pipeline();
    tagIds.forEach(key => tagsPipeline.hgetall("tag:" + key));
    const tags = await tagsPipeline.exec();

    post.user = await redis.hgetall("user:" + post.author);
    post.custom_fields = JSON.parse(await redis.get("custom_fields:" + post.postId));
    post.postContent = postContent.map((value, index) => {
        value[1].attrs = attrs[index][1];
        return value[1]
    });
    post.cats = categories.map( cat => cat[1]);
    post.tags = tags.map( tag => tag[1]);
    return post;
}
