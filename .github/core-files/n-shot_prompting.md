# N-Shot Prompting

## Prompt

For our task, all data classes should be formatted in the following way.

```chsarp
namespace ProjectName.Models.GoogleGeocodingResult
{
    using Newtonsoft.Json;
    using System.Collections.Generic

    /// <summary>
    ///     A single result object returned in an array of results.
    ///     https://developers.google.com/maps/documentation/geocoding/requests-geocoding#results
    /// </summary>
    public class Result
    {
        /// <summary>
        ///     Gets or sets a list containing the separate components applicable to this address.
        /// </summary>
        [JsonProperty("addressComponents")]
        public IList<AddressComponents> AddressComponents { get; set; } = new List<AddressComponents>();

        /// <summary>
        ///     Gets or sets a string containing the human-readable address of this location.
        /// </summary>
        [JsonProperty("formattedAddress")]
        public string FormattedAddress { get; set; }

        /// <summary>
        ///     Gets or sets the geometry, which contains the geocoded latitude, longitude value and location type.
        /// </summary>
        [JsonProperty("geometry")]
        public Geometry Geometry { get; set; }

        /// <summary>
        ///     Gets or sets an indicator that the geocoder did not return an exact match for the original request.
        /// </summary>
        [JsonProperty("partialMatch")]
        public string PartialMatch { get; set; }

        /// <summary>
        ///     Gets or sets a unique identifier that can be used with other Google APIs.
        /// </summary>
        [JsonProperty("placeId")]
        public string PlaceId { get; set; }

        /// <summary>
        ///     Gets or sets an encoded location reference, derived from latitude and longitude coordinates,
        ///     that can be used as a replacement for street addresses in places where they do not exist.
        /// </summary>
        [JsonProperty("plusCode")]
        public PlusCode PlusCode { get; set; }

        /// <summary>
        ///     Gets or sets the types array that indicates the types of the returned result.
        /// </summary>
        [JsonProperty("types")]
        public string[] Types { get; set; }
    }
}
```

Now, reformat the following class to the above standard:

```csharp
public class Dailyinfo
{
    // This object contains the daily forecast information for each day requested.
    public Date date { get; set; } //The date in UTC at which the pollen forecast data is represented.
    public Pollentypeinfo[] pollenTypeInfo { get; set; } // This list will include (up to) three pollen types (grass, weed, tree) affecting the location specified in the request.
    public Plantinfo[] plantInfo { get; set; } //This list will include (up to) 15 pollen species affecting the location specified in the request.
    public string regionCode { get; set; } //The ISO_3166-1 alpha-2 code of the country/region corresponding to the location provided in the request.
}

```
