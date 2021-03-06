% Generated by roxygen2: do not edit by hand
% Please edit documentation in R/SensusR.R
\name{sensus.remove.device.id}
\alias{sensus.remove.device.id}
\title{Removes all data associated with a device ID from a data collection.}
\usage{
sensus.remove.device.id(datum, device.id)
}
\arguments{
\item{datum}{Data collection to process.}

\item{device.id}{Device ID to remove.}
}
\value{
Data without a particular device ID.
}
\description{
Removes all data associated with a device ID from a data collection.
}
\examples{
data.path = system.file("extdata", "example_data", package="SensusR")
data = sensus.read.json(data.path)
filtered.data = sensus.remove.device.id(data$AccelerometerDatum, "a448s0df98f")
}

