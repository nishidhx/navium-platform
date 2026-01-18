/ * Type for Safe Wrapper */
export type SafeResult<T> = {
    data?: T,
    error?: Error 
}

/ * Safe Wrapper function */
export function safeWrapper<Targs extends any[], Tresult>(
    fn: (...args: Targs) => Tresult | Promise<Tresult>
) {
    return async (...args: Targs): Promise<SafeResult<Tresult>> => {
        try {
            const result = fn(...args);

            if (result instanceof Promise) {
                try {
                    const data = await result
                    return ({ data })
                } catch (error) {
                    return ({ error: error as Error })
                }            
            }

            return Promise.resolve({ data: result });
        }catch(error) {
            return Promise.resolve({ error: error as Error });
        }
    }    
}