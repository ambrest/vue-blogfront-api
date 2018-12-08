const typeDef = ``;

const query = `
    author: String,
    version: Int,
`;

const resolver = {
    Query: {
        author: () => {
            return "Ambrest Designs LLC";
        },

        version: () => {
            return 1.0;
        }
    }
};

module.exports = {typeDef, query, resolver};
