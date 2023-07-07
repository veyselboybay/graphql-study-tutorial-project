const { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLSchema, GraphQLList, GraphQLNonNull, GraphQLEnumType } = require('graphql')

// MOngoose Models
const Project = require('../models/Project.js')
const Client = require('../models/Client.js')


// Client Type
const ClientType = new GraphQLObjectType({
    name: 'client',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        phone: { type: GraphQLString }
    })
});

// Project Type
const ProjectType = new GraphQLObjectType({
    name: 'project',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        status: { type: GraphQLString },
        client: {
            type: ClientType,
            resolve(parent, args) {
                return Client.findById(parent.clientId);
            }
        }
    })
})

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        // Client Related 
        client: {
            type: ClientType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                return Client.findById(args.id);
            }
        },
        clients: {
            type: GraphQLList(ClientType),
            resolve(parent, args) {
                return Client.find();
            }
        },
        // Project Related
        project: {
            type: ProjectType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                return Project.findById(args.id);
            }
        },
        projects: {
            type: GraphQLList(ProjectType),
            resolve(parent, args) {
                return Project.find();
            }
        }
    }
})

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addClient: {
            type: ClientType,
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
                email: {type: GraphQLNonNull(GraphQLString)},
                phone: {type: GraphQLNonNull(GraphQLString)},
            },
            resolve(parent, args) {
                const client = new Client({
                    name: args.name,
                    email: args.email,
                    phone: args.phone,
                })

                return client.save();
            }
        },
        deleteClient: {
            type: ClientType,
            args: { id: {type: GraphQLID} },
            async resolve(parent, args) {
                const projects = await Project.find({ clientId: args.id });
                await projects.forEach(proj => proj.deleteOne());
                const client = Client.findByIdAndRemove(args.id);
                return client;
            }
        },
        // Project section
        addProject: {
            type: ProjectType,
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
                description: { type: GraphQLNonNull(GraphQLString) },
                status: {
                    // type: new GraphQLEnumType({
                    //     name: 'Project Status',
                    //     values: {
                    //         new: { value: 'Not Started' },
                    //         progress: { value: 'In Progress' },
                    //         completed: {value: 'Completed'}
                    //     }//['Not Started', 'In Progress', 'Completed']
                    // }),
                    type: GraphQLString,
                    defaultValue: 'Not Started'
                },
                clientId: {
                    type: GraphQLNonNull(GraphQLID)
                }
            },
            resolve(parent, args) {
                const project = new Project({
                    name: args.name,
                    description: args.description,
                    status: args.status,
                    clientId: args.clientId,
                });
                return project.save();
            }
        },

        // delete project
        deleteProject: {
            type: ProjectType,
            args: {
                id: {type: GraphQLID}
            },
            resolve(parent, args) {
                return Project.findByIdAndRemove(args.id);
            }
        },

        // update project
        updateProject: {
            type: ProjectType,
            args: {
                id: { type: GraphQLID },
                name: { type: GraphQLString },
                description: { type: GraphQLString },
                status: { type: GraphQLString },
            },
            resolve(parent, args) {
                return Project.findByIdAndUpdate(
                    args.id,
                    {
                        $set: {
                            name: args.name,
                            description: args.description,
                            status: args.status,
                        }
                    },
                    {new:true}
                )
            }
        }
    }
})


module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
})