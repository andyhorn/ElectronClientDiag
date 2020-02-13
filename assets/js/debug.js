module.exports = {
    log: function(out) {
        if (process.env.NODE_ENV != 'production') {
            console.log(`[${Date.now()}]\t${out}`)
        }
    },
    print: function(out) {
        if (process.env.NODE_ENV != 'production') {
            console.log(out)
        }
    }
}