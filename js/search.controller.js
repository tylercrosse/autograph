"use strict";

(function(){
  angular
  .module("carGraphingApp")
  .controller("searchController", [
    "$scope",
    "SearchFactory",
    SearchControllerFunction]);

  function SearchControllerFunction($scope, SearchFactory){

    var searchVm = this;
    searchVm.onRefresh = function(newData, maxP, maxM){
      console.log('here in refresher')
      var chart = $('.container').highcharts();
      chart.series[0].setData(newData, true);
      chart.xAxis[0].setExtremes(0, (maxM * 1.1));
      chart.yAxis[0].setExtremes(0, (maxP * 1.1));
      chart.redraw();
    }

    this.search = function(){

      SearchFactory.sendData(this.searchTerms)
      .then(function(res){
        searchVm.cars = [];
        if (searchVm.searchComplete){searchVm.searchComplete = false;}
        searchVm.maxMileage = 0;
        searchVm.maxPrice = 0;
        console.log("boop bip bip");
        console.log(res);

        for(var j=0; j<res.length; j++){
          searchVm.rawCars = res[j]
          console.log(searchVm.rawCars)
          for(var i=0; i<searchVm.rawCars.length; i++){
            if (searchVm.rawCars[i].ItemSpecifics){
              var toParse = searchVm.rawCars[i].ItemSpecifics.NameValueList;
              searchVm.c = {}
              jQuery.grep(toParse, function(n){
                if (n.Name == "Make") {searchVm.c.model = n.Value[0];}
                if (n.Name == "Model") {searchVm.c.make = n.Value[0];}
                if (n.Name == "Year") {searchVm.c.year = parseInt(n.Value[0]);}
                if (n.Name == "Mileage") {searchVm.c.mileage = parseInt(n.Value[0]);}
              })

              if (searchVm.c.mileage > searchVm.maxMileage) {
                searchVm.maxMileage = searchVm.c.mileage
              }
              if (searchVm.rawCars[i].ConvertedCurrentPrice.Value > searchVm.maxPrice){
                searchVm.maxPrice = searchVm.rawCars[i].ConvertedCurrentPrice.Value
              }
              searchVm.cars.push({
                make: searchVm.c.make,
                model: searchVm.c.model,
                y: searchVm.rawCars[i].ConvertedCurrentPrice.Value,
                year: searchVm.c.year,
                x: searchVm.c.mileage,
                location: searchVm.rawCars[i].Location,
                listing_url: searchVm.rawCars[i].ViewItemURLForNaturalSearch,
                picture_url: searchVm.rawCars[i].GalleryURL,
                condition: searchVm.rawCars[i].ConditionDisplayName
              })
            }
          }
        }
        setTimeout(searchVm.onRefresh(searchVm.cars, searchVm.maxPrice, searchVm.maxMileage), 400)
      })
    }
  }

}());
