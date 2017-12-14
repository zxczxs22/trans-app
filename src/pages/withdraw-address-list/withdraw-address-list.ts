import { Component } from '@angular/core';
import {
	IonicPage,
	NavController,
	NavParams,
	Platform,
	ViewController
} from 'ionic-angular';
import {
	AccountType,
	AccountServiceProvider,
	PaymentCategory,
	ProductModel,
	CryptoCurrencyModel,
	DealResult
} from '../../providers/account-service/account-service';
import { SecondLevelPage } from '../../bnlc-framework/SecondLevelPage';
import { asyncCtrlGenerator } from '../../bnlc-framework/Decorator';
/**
 * Generated class for the WithdrawAddressListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
	selector: 'page-withdraw-address-list',
	templateUrl: 'withdraw-address-list.html'
})
export class WithdrawAddressListPage extends SecondLevelPage {
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public platform: Platform,
		public accountService: AccountServiceProvider,
		public viewCtrl: ViewController
	) {
		super(navCtrl, navParams);
	}
	formData: { withdraw_address_id: CryptoCurrencyModel['id'] } = {
		withdraw_address_id: undefined
	};

	navbar_title: string;
	productInfo: ProductModel;
	withdraw_address_list: CryptoCurrencyModel[];
	@WithdrawAddressListPage.willEnter
	initData() {
		this.productInfo = this.navParams.get('productInfo');
		this.withdraw_address_list = this.navParams.get(
			'withdraw_address_list'
		);
		this.formData.withdraw_address_id = this.navParams.get('selected_data');
		this.navbar_title = this.navParams.get('title');
		if (!this.withdraw_address_list) {
			this.navCtrl.removeView(this.viewCtrl);
		}
	}
	is_withdraw_address_list_changed = false;

	finishSelect(send_selected_data?: boolean) {
		this.viewCtrl.dismiss({
			selected_data: send_selected_data
				? this.withdraw_address_list.find(
						v => v.id == this.formData.withdraw_address_id
					)
				: null,
			withdraw_address_list: this.is_withdraw_address_list_changed
				? this.withdraw_address_list
				: null
		});
	}

	@asyncCtrlGenerator.loading()
	@asyncCtrlGenerator.error('地址删除失败')
	@asyncCtrlGenerator.success('地址删除成功')
	async deleteWithdrawAddress(withdraw_address: CryptoCurrencyModel) {
		await this.accountService.deleteWithdrawAddress(withdraw_address.id);
		this.is_withdraw_address_list_changed = true;
		this.withdraw_address_list = await this.accountService.getWithdrawAddress(
			this.productInfo.productId
		);
		// 强行重新绑定数据来FIX ionic的ion-radio绑定错乱的BUG
		const _v = this.formData.withdraw_address_id;
		this.formData.withdraw_address_id = null;
		this.platform.raf(() => {
			this.formData.withdraw_address_id = _v;
		});
		return this.withdraw_address_list;
	}
}