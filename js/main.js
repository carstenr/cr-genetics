const max = 800;

var app = new Vue({
  el: '#app',
  data: {
    cities: [],
    population: [],
    cityCount: 5,
    supportedPopulation: 50,
    generation: 1,
    power: 100000,
    slide: 1
  },
  methods: {
    simulate() {
      if (this.generation >= 400) {
        return
      }
      this.nextGen();
      let slowdown = 1800;
      if (this.generation > 10) {
        slowdown = 200;
      }
      if (this.generation > 40) {
        slowdown = 0;
      }
      setTimeout(() => {
        this.simulate();
      }, slowdown)
    },
    nextGen () {
      // Mate, doubles population
      for (let i = 0; i<this.supportedPopulation; i++) {
        // Pick by rand for pairings
        const femaleIndex = Math.floor(Math.random() * this.supportedPopulation);
        const female = this.population[femaleIndex];
        const maleIndex = Math.floor(Math.random() * this.supportedPopulation);
        const male = this.population[maleIndex];
        this.population.push(this.mate(female, male));
      }
      // Mutation
      for (let i = 0; i<this.supportedPopulation/4; i++) {
        this.population.push(this.spawnRoute());
      }
      // Sort
      this.population.sort((a,b) => {
        return this.calculateFitness(a) - this.calculateFitness(b);
      })
      // starve
      this.generation++;
      this.population = this.population.slice(0, this.supportedPopulation)
      this.render();
    },
    render() {
      this.canvas.clearRect(0, 0, max, max);
      this.canvas.fillText(this.generation, 774, 44);
      this.cities.forEach((city) => {
        this.canvas.beginPath();
        this.canvas.arc(city[0], city[1], 7, 0, 2 * Math.PI);
        this.canvas.fill();
      })
      if (this.generation > 1) {
        const route = this.population[0];
        for (let i=0; i < route.length-1; i++) {
          const start = this.cities[route[i]];
          const end = this.cities[route[i+1]];
          this.canvas.beginPath();
          this.canvas.moveTo(start[0], start[1]);
          this.canvas.lineTo(end[0], end[1]);
          this.canvas.stroke();
        }
      }
    },
    calculateFitness (route) {
      let dist = 0;
      for (let i=0; i<this.cityCount-1; i++) {
        let indexA = route[i]
        let indexB = route[i+1]
        let cityA = this.cities[indexA];
        let cityB = this.cities[indexB];
        let xdiff = cityA[0] - cityB[0];
        let ydiff = cityA[1] - cityB[1];
        let abdist = Math.sqrt(Math.pow(xdiff, 2) + Math.pow(ydiff, 2));
        dist += abdist
      }
      return dist;
    },
    mate (female, male) {
      // keep first half from female
      let result = female.slice(0, Math.floor(this.cityCount/2))
      // for each in male: is in a, if not, add, if yes, skip, till full
      male.forEach((cityIndex) => {
        if (result.length === this.cityCount) {
          return;
        }
        if (!result.includes(cityIndex)) {
          result.push(cityIndex);
        }
      })
      return result;
    },
    spawnRoute() {
      let route = Array.from(Array(this.cityCount).keys())
      route.sort(() => Math.random() - 0.5);
      return route;
    },
    spawnCity () {
      const min = 0;
      const x = Math.random() * (max - min) + min;
      const y = Math.random() * (max - min) + min;
      return [Math.floor(x), Math.floor(y)];
    },
    addCity () {
      let city = this.spawnCity()
      this.cities.push(city)
      this.cityCount++;
      this.generation=1;
      this.initPop()
      this.render()
    },
    initPop () {
      this.population = []
      for (let i=0; i<this.supportedPopulation; i++) {
        let route = this.spawnRoute();
        this.population.push(route);
      }
    },
    nextSlide() {
      this.slide++;
      if (this.slide > 8) {
        this.slide = 1;
      }
    },
    reset() {
      this.cityCount = 5;
      this.generation = 1;
      this.cities = [];
      // init cities
      for (let i=0; i<this.cityCount; i++) {
        let city = this.spawnCity();
        this.cities.push(city);
      }
      this.initPop();
      this.render();
    }
  },
  created: function () {
    this.reset();
  },
  computed: {
    solutions: function() {
      let rval=1;
      for (let i = 2; i <= this.cityCount; i++) {
        rval = rval * i;
      }
      return rval;
    },
    fittestFitness: function() {
      if (this.generation === 1) {
        return '-';
      }
      return Math.floor(this.calculateFitness(this.population[0]));
    },
    ttc: function() {
      const seconds = this.solutions / this.power;
      if (seconds < 60) {
        if (seconds > 1) {
          return Math.floor(seconds) + 's';
        }
        return seconds + 's'
      }
      const minutes = seconds / 60;
      if (minutes < 60) {
        return Math.floor(minutes) + 'm'
      }
      const hours = minutes / 60;
      if (hours < 24) {
        return Math.floor(hours) + 'h'
      }
      const days = hours / 24;
      if (days < 365) {
        return Math.floor(days) + 'd'
      }
      const years = days / 365;
      if (years < 74) {
        return Math.floor(years) + 'y';
      }
      if (years < 2020) {
        return 'Länger als Computer existieren. (1946)';
      }
      if (years < 300000) {
        return 'Länger als Christi Geburt.';
      }
      if (years < 16000000000) {
        return 'Länger als der erste Mensch (300.000 Jahre).';
      }
      return 'Lebensalter des Universums (16 Mrd. Jahre)';
    }
  },
  mounted() {
    let c = document.getElementById("c");
    this.canvas = c.getContext("2d");
    this.canvas.strokeStyle = "#FFFFFF";
    this.canvas.lineWidth = 2;
    this.canvas.fillStyle = "#FFFFFF";
    this.canvas.font = "28px Arial Black";
    this.canvas.textAlign = 'right';
    this.render();
  }
})
