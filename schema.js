export default `

type Query {
  get(key: String!): Post
  posts: [Post]
}

      type Post {
        _id: String
        postId: Int
        author: Int
        categories: [Int]
        comment_status: String
        guid: String
        post_modified: String
        post_modified_gmt: String
        post_name: String
        post_parent: Int
        post_status: String
        post_title: String
        post_type: String
        comment_count: String
        thumbnail: String
        permalink: String
        post_excerpt: String
        postContent: [Block]
        tags: [Tag]
        cats: [Category]
        user: User
        custom_fields: [CustomField]
        purpleIssue: Int
        purpleIssueArticles: [Int]
        issuePosts: [Post]
        comments: [Int]
        commentFields: [Comment]
      }

       
      type CustomField {
        field: String
        value: String
      }
      
      type Comment {
        comment_id: Int
        author: Int
        comment_date: String
        text: String
        comment_post_ID: Int
        status: String
      }
      
      type User {
        user_id: Int
        login: String
        display_name: String
        email: String
      }
      
      type Block {
        blockName: String
        attrs: Attr
        innerBlocks: [Block]
        innerHTML: String
        innerContent: [String]
      }
      
      type Attr {
        align: String
        className: String
        id: Int
        level: Int
        sizeSlug: String
        content: String
        purpleId: String
      }
      
      type Category {
        _id: String
        term_id: Int
        name: String
      }
      
      type Tag {
        _id: String
        term_id: Int
        name: String
        slug: String
      }

`;
