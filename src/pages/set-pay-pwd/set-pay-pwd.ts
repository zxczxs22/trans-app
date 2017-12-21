import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
	Platform,
	ActionSheetController,
	ModalController,
	NavController,
	NavParams,
	ViewController
} from 'ionic-angular';
import { SecondLevelPage } from '../../bnlc-framework/SecondLevelPage';
import { asyncCtrlGenerator } from '../../bnlc-framework/Decorator';
import {
	AccountServiceProvider,
	CertificationCertificateType,
	AuthenticationModel
} from '../../providers/account-service/account-service';

@Component({
	selector: 'page-set-pay-pwd',
	templateUrl: 'set-pay-pwd.html'
})
export class SetPayPwdPage extends SecondLevelPage {
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public accountService: AccountServiceProvider
	) {
		super(navCtrl, navParams);
	}
	formData: {
		payPWD: string;
		confirmPayPWD: string;
		loginPWD: string;
		check_method: AuthenticationModel;
		vcode: string;
	} = {
		payPWD: '',
		confirmPayPWD: '',
		loginPWD: '',
		check_method: null,
		vcode: ''
	};
	errors: any = {};

	@SetPayPwdPage.setErrorTo('errors', 'confirmPayPWD', ['no_same'])
	check_two_pay_pwd() {
		if (this.formData.payPWD !== this.formData.confirmPayPWD) {
			return { no_same: true };
		}
	}

	check_method_options: any[];
	@SetPayPwdPage.willEnter
	@asyncCtrlGenerator.loading()
	@asyncCtrlGenerator.error('加载用户信息出错')
	async getCheckMethodOptions() {
		return (this.check_method_options = await this.accountService.getAuthenticateDetail(
			{
				type: CertificationCertificateType.账号
			}
		));
	}
	@asyncCtrlGenerator.loading('验证码发送中')
	@asyncCtrlGenerator.error('验证码发送出错')
	@asyncCtrlGenerator.success('验证码发送成功')
	sendValidate() {
		const { check_method } = this.formData;
		return this.accountService.sendValidateToCustomer(
			check_method.category,
			check_method.id
		);
	}
	get canSubmit() {
		// 表单中所有的值都不能为空
		return (
			this.protocolAgree &&
			Object.keys(this.formData).every(k => this.formData[k]) &&
			!this.hasError(this.errors)
		);
	}
	protocolAgree = true;
	toggleProtocolAgree() {
		this.protocolAgree = !this.protocolAgree;
	}

	@asyncCtrlGenerator.loading()
	@asyncCtrlGenerator.error('交易密码设置出错')
	@asyncCtrlGenerator.success('交易密码设置成功')
	submitForm() {
		const { formData } = this;
		return this.accountService
			.setAccountPWD(
				formData.payPWD,
				formData.loginPWD,
				formData.check_method.category,
				formData.vcode
			)
			.then(() => {
				this.finishJob(true);
			});
	}
}
