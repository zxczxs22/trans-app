import { Component } from "@angular/core";
import { EntrustServiceProvider } from "../../providers/entrust-service";
import {
  NavParams,
  Refresher,
  InfiniteScroll,
  AlertController,
  ModalController,
  ToastController
} from "ionic-angular";
import { asyncCtrlGenerator } from "../../bnlc-framework/Decorator";
import { PersonalDataService } from "../../providers/personal-data-service";
import { AppService } from "../../providers/app.service";
import { Http, RequestMethod, URLSearchParams } from "@angular/http";
import { AppDataService } from "../../providers/app-data-service";
import { AppSettingProvider } from "../../bnlc-framework/providers/app-setting/app-setting";
import { CustomizeAlert } from "../../modals/customize-alert/customize-alert";
import { AlertService } from "../../providers/alert-service";

@Component({
  selector: "page-invite-commission",
  templateUrl: "invite-commission.html"
})
export class InviteCommissionPage {
  recommendCounts = "";
  recommender = "";

  ref;
  page = 1;
  pageSize = 10;
  hasMore: boolean = true;
  recharge_address = {
    index: "asdf1234"
  };
  initData(refresher?: Refresher) {
    this.requestRecommendData(); //获取邀请多少人
    this.requestRecommender();
  }

  constructor(
    /*public navCtrl: NavController*/
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public entrustServiceProvider: EntrustServiceProvider,
    public personalDataService: PersonalDataService,
    public appService: AppService,
    public appDataService: AppDataService,
    public setting: AppSettingProvider,
    public modalCtrl: ModalController,
    public alertService: AlertService,
    public toastCtrl: ToastController
  ) {
    this.initData();
    this.ref =
      this.setting.RECOMMEND_PREFIX + this.personalDataService.recommendCode;
  }

  @asyncCtrlGenerator.success("复制成功")
  @asyncCtrlGenerator.error("复制失败")
  async copyCode() {
    if (!this.recharge_address.index) {
      throw new Error("无可用地址");
    }
    if (!navigator["clipboard"]) {
      throw new Error("复制插件异常");
    }
    navigator["clipboard"].writeText(this.recharge_address.index);
  }

  set() {
    let modal = this.modalCtrl.create(CustomizeAlert,
      {tip:"请输入邀请码"},
      { showBackdrop: true, enableBackdropDismiss: true });
    modal.onDidDismiss(returnData => {
      if (returnData) {
        this.setRecommender(returnData);
      }
		  });
		modal.present();
  }
  //获取推荐了多少人
  requestRecommendData(): Promise<any> {
    const path = `/user/getRecommendCount`;
    return this.appService
      .request(
        RequestMethod.Get,
        path,
        { customerId: this.appDataService.customerId },
        true
      )
      .then(data => {
        if (!data) {
          return Promise.reject(new Error("data missing"));
        }
        this.recommendCounts = data.count[0].count;
      })
      .catch(err => {
        console.log("getCustomersData error: ", err);
      });
  }

  //获取我的推荐人
  requestRecommender(): Promise<any> {
    const path = `/user/getMyRecommender`;
    return this.appService
      .request(RequestMethod.Get, path, undefined, true)
      .then(data => {
        if (!data) {
          return Promise.reject(new Error("data missing"));
        }
        if (data.realName) {
          this.recommender = data.realName;
        } else if (data.telephone) {
          this.recommender = data.telephone;
        } else if (data.email) {
          this.recommender = data.email;
        }
      })
      .catch(err => {
        console.log("getCustomersData error: ", err);
      });
  }

    //设置推荐人
    setRecommender(code): Promise<any> {
      const path = `/user/setInvitationCode`;
      return this.appService
        .request(RequestMethod.Post, path, {code: code}, true)
        .then(data => {
          if (!data) {
            return Promise.reject(new Error("data missing"));
          }
          this.alertService.dismissLoading();
          this.alertService.alertTips(data.message);
          this.requestRecommender();
        })
        .catch(err => {
          this.alertService.dismissLoading();
          this.alertService.showAlert('警告', err.message?err.message:err);
          console.log("getCustomersData error: ", err);
        });
    }
}
