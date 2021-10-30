import { Component, OnInit } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})

export class DashboardComponent implements OnInit {
  multi = [
    {
      "name": "Total Sales",
      "series": [
        {
          "name": "10th",
          "value": 62000000
        }, {
          "name": "12th",
          "value": 62000000
        }, {
          "name": "13th",
          "value": 62000000
        }, {
          "name": "15th",
          "value": 62000000
        }, {
          "name": "16th",
          "value": 62000000
        }, {
          "name": "17th",
          "value": 62000000
        }, {
          "name": "18th",
          "value": 62000000
        }, {
          "name": "19th",
          "value": 62000000
        },
        {
          "name": "20th",
          "value": 73000000
        },
        {
          "name": "22nd",
          "value": 89400000
        }
      ]
    }
  ];
  view: any[] = [599, 265];

  // options
  legend: boolean = false;
  showLabels: boolean = false;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = '';
  yAxisLabel: string = '';
  timeline: boolean = false;

  colorScheme = {
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
  };

  products = [{
    name: "Amulya Growth Plus",
    src: "https://office.amulyaherbs.com/upload/image/HC10005.jpg",
    number: "2332"
  }, {
    name: "Amulya Growth Plus",
    src: "https://office.amulyaherbs.com/upload/image/HC10005.jpg",
    number: "2332"
  }, {
    name: "Amulya Growth Plus",
    src: "https://office.amulyaherbs.com/upload/image/HC10005.jpg",
    number: "2332"
  }, {
    name: "Amulya Growth Plus",
    src: "https://office.amulyaherbs.com/upload/image/HC10005.jpg",
    number: "2332"
  }, {
    name: "Amulya Growth Plus",
    src: "https://office.amulyaherbs.com/upload/image/HC10005.jpg",
    number: "2332"
  }];
  regions = [{
    name: "Central India", value: "2,22,80.00", type: 'gain'
  }, {
    name: "East India", value: "2,22,80.00", type: 'loss'
  }, {
    name: "North India", value: "2,22,80.00", type: 'loss'
  }, {
    name: "South India", value: "2,22,80.00", type: 'gain'
  }, {
    name: "West India", value: "2,22,80.00", type: 'gain'
  }, {
    name: "North-west India", value: "2,22,80.00", type: 'gain'
  }];
  distributors = [{
    name: "Ayurveda Home, Kochi", value: "2,22,80.00"
  }, {
    name: "Ayurveda Home, Kochi", value: "2,22,80.00"
  }, {
    name: "Ayurveda Home, Kochi", value: "2,22,80.00"
  }, {
    name: "Ayurveda Home, Kochi", value: "2,22,80.00"
  }, {
    name: "Ayurveda Home, Kochi", value: "2,22,80.00"
  }];

  constructor() { }

  ngOnInit(): void {
  }

  onSelect(data): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data): void {
    console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data): void {
    console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }

}
