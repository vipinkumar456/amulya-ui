import { Component, OnInit } from '@angular/core';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { ProductsService } from '../services/products.service';
import { PATH } from '../constants';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../services/toast.service';
@Component({
  selector: 'app-debit-credit-note',
  templateUrl: './debit-credit-note.component.html',
  styleUrls: ['./debit-credit-note.component.css']
})
export class DebitCreditNoteComponent implements OnInit {

  purchaseOrder: any = null;
  QCOrder: any = null;
  invoiceData:any = null;
  items:any=[];
  heading:any=null;
  constructor( private prodService: ProductsService,
    private route: ActivatedRoute,
    private router: Router,
    public toastService: ToastService,) { }

  ngOnInit(): void {
    this.route.params.subscribe((res) => {
      console.log(res);
      if(res.type=='PO')
      {
        this.purchaseOrder=res.id;
        this.getPurchaseOrder();
        this.heading='Debit/Credit Note For Purchase Order';
      }
      if(res.type=='QC')
      {
        this.QCOrder=res.id;
        this.getQCOrder();
        this.heading='Debit/Credit Note For QC Order';
      }
      
    });
    
  }

  getPurchaseOrder()
  {
    debugger
    this.prodService
    .getData(
      `${PATH.PURCHASEORDER_DEBIT}/${this.purchaseOrder}`
    )
    .subscribe(
      (res) => {
        console.log(res)
        this.invoiceData=res;
        this.items=res['items'];
        console.log(this.items);
      },
      (err) => {
        this.router.navigate(['purchases']);
        this.toastService.show(
          err,
          { classname: 'amulyaRed text-light', delay: 5000 }
        );
        
      }
  );
  }
  getQCOrder()
  {
    this.prodService
    .getData(
      `${PATH.QCORDER_DEBIT}/${this.QCOrder}`
    )
    .subscribe(
      (res) => {
        console.log(res)
        this.invoiceData=res;
        this.items=res['items'];
        console.log(this.items);
      },
      (err) => {
      
        this.router.navigate(['purchases']);
        this.toastService.show(
          err,
          { classname: 'amulyaRed text-light', delay: 5000 }
        );
      }
  );

  }

  exportHtmlToPDF(){
    let data = document.getElementById('htmltable');
      html2canvas(data).then(canvas => {
          
          let docWidth = 208;
          let docHeight = canvas.height * docWidth / canvas.width;
          
          const contentDataURL = canvas.toDataURL('image/png')
          let doc = new jsPDF('p', 'mm', 'a4');
          let position = 0;
          doc.addImage(contentDataURL, 'PNG', 0, position, docWidth, docHeight)
          
          doc.save('exportedPdf.pdf');
      });

     
  }

}
