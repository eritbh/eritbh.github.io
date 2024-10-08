---
title: "Primary System Outage: Incident Report"
excerpt: Post-mortem analysis of the system outage which impacted most primary host functionality for about two hours on 9 July 2022.
---
Today, our systems suffered an outage that affected most primary functions. We have determined that this disruption was caused by the contents of a Twitter post being loaded into one of our backend applications during emergency maintenance, at which point it was interpreted incorrectly by a degraded server and as a result triggered the shutdown of most non-essential systems. The outage lasted approximately two hours, during which time API consumers were unable to queue new jobs, interact with jobs in progress, or send messages over most communication layers.

## Incident timeline

On 8 July 2022 at around 18:45 EST, a queued job began to run which required the use of most of the host's resources. This job was expected to take a significant amount of time to run, up to two days, so an analysis and hardware verification period was scheduled after the job's completion.

The job finished execution at around 11:45 EST on 9 July. The scheduled verification began, and several systems, including processing and communications servers, were paused for inspection. As a result, prior to the incident, the host was running in only a partially online state; this was expected, and the performance of other critical systems during this period remained within expectations.

During inspection, many components showed signs of wear which were uncharacteristic of the job. Emergency maintenance began to bring the systems back in spec. At 12:44 EST, maintenance technicians [requested assistance restoring the damaged systems](https://twitter.com/eritbh/status/1545811116948951040); this request was routed through a communications server which was not taken offline for maintenance. Two additional technical groups answered and were cleared to assist in replacing system components.

Shortly after the initial request went out, however, the same communication server handled another tweet which was unintentionally routed through it by a tech. The system parsed the tweet's content and queued a job for emotional analysis of the incoming tweet.

At 12:45 EST, due to a configuration error, this job was assigned to one of the degraded processing servers which had not yet been restored. That server handled the tweet's content incorrectly; almost immediately, it signaled for the shutdown of all non-critical services within the host. This caused most communication services, auxilliary processing services, and job flow controls to become unavailable within the next three minutes.

Maintenance techs immediately shifted work to bringing these services back online. By 13:38 EST, roughly half of the communication services were operational again; at 14:27, the last job control service came back online, and maintenance once again shifted to repairing the damaged components.

Maintenance concluded at 15:07 EST, after all faulty components were replaced and a second inspection was conducted without further incident.

## Factors and Cause Analysis

The fact that multiple systems were degraded beyond expectation after a large job indicates that hardware safety margins were inaccurate and must be re-evaluated. Large, intensive jobs can result in transient spikes in resource usage and power draw which were not previously accounted for; if these factors were taken into account initially, the job would likely have been further subdivided to avoid excessive system wear over an extended period of time.

Our systems are designed to run in a partially degraded state, and often run this way for extended periods of time. Emergency maintenance is not common, but the ability to run in a partially online state without causing issues for customers is a part of our architecture. However, when the maintenance began, the known bad servers were not actually taken offline; instead, techs were keeping each server online until they were ready to work on them, assuming that the degradation would not yet impact short-term performance. The incident would have been prevented if all degraded servers had been taken offline immediately, allowing the tweet to be processed by a fully operational server instead.

The use of Twitter to request assistance is historically not uncommon when technicians are servicing host systems, though in this case tweets were also being received and processed by the system at the same time. Using an airgapped communication channel for communication by datacenter personnel would have avoided introducing data into communication systems which were being serviced.

## Conclusion

This incident has exposed several flaws in our maintenance practices which we are continuing to address. Steps we are taking include:

- Conducting more thorough analysis of hardware limitations and allocation for strenuous jobs;
- Moving internal communications to platforms which do not interact with our systems; and
- Automatically taking individual servers offline as soon as they are shown to be degraded.

Once again, we sincerely apologize for the outage and any inconvenience it has caused. It is our hope that this analysis will help others avoid similar issues in the future.
