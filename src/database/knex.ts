import Knex from 'knex';

const showQueries = !!process.env.SHOW_QUERIES

export const knex = Knex({
    client: 'mysql',
    connection: {
        host: 'localhost',
        user: 'api',
        database: 'final_project',
        password: 'totallysecurepassword'
    }
});

export const checkConnection = async () => {
    if(showQueries){
        console.log("Connecting to database...");
    }
    await knex.select(knex.raw('1'));
    if(showQueries){
        console.log("Database connection succeeded");
    }
}

export const query = async <T>(qb: Knex.QueryBuilder): Promise<T> => {
    const results = await qb;
    const {sql, bindings} = qb.toSQL().toNative();
    if(showQueries){
        console.log(`========= Executing Query =========`);
        console.log(`Query without bindings: `, sql);
        const splitOnBinding = sql.split('?');
        if(splitOnBinding.length > 1) {
            console.log(`Query with bindings: `, splitOnBinding.map((s,i) => {
                if(i < splitOnBinding.length - 1) return s + JSON.stringify(bindings[i]);
                return s;
            }).join(''));
        }
        console.log('\n');
    }
    return results;
}