class DentistScheduler {
    constructor(configuration) {
        this.getAvailability = async () => {
            const response = await fetch(configuration.SchedulerEndpoint + "availability")
            console.log("**********")
            console.log(response)
            console.log("***************")
            const times = await response.json()

            console.log("**********")
            console.log(response.json())
            console.log("***************")
            let responseText = `Current time slots available: `
            times.map(time => {
                responseText += `${time}`
            })
            return responseText
        }

        this.scheduleAppointment = async (time) => {
            const response = await fetch(configuration.SchedulerEndpoint + "schedule", { method: "post", body: { time: time } })
            let responseText = `An appointment is set for ${time}.`
            return responseText
        }
    }
}

module.exports = DentistScheduler