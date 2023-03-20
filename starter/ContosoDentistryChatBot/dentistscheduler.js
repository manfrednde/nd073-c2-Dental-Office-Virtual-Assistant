class DentistScheduler {
    constructor(configuration) {
        this.getAvailability = async () => {
            const response = await fetch(configuration.SchedulerEndpoint + "availability", { method: "get"})
            const times = await response.json()
            let responseText = `Current time slots available: `
            times.map(time => {
                responseText += ` ${time}`
            })
            return responseText
        }

        this.scheduleAppointment = async (time) => {
            const response = await fetch(configuration.SchedulerEndpoint + "schedule", { method: "post", body: { time: time } })
            let responseText = `An appointment is set for ${time}.`
            console.log(responseText)
            return responseText
        }
    }
}

module.exports = DentistScheduler