const mainSwitchContainer = `
  <div id="mainSwitchContainer">
    <div>
      <input id="mainSwitch" type="checkbox" name="mainSwitch" checked="checked">
      <label for="mainSwitch" class="mainSwitch"></label>
    </div>
    
    <style>
      #mainSwitchContainer {
        height: 89px;
        width: 158px;
      }
      
      #mainSwitchContainer > div {
        width: 151px;
        height: 60px;
        position: relative;
        inset-block-start: 31px;
        left: 3px;
      }
      
      #mainSwitchContainer *, #mainSwitchContainer *:after, #mainSwitchContainer *:before {
        box-sizing: border-box;
      }
      
      #mainSwitch {
        visibility: hidden;
        clip: rect(0 0 0 0);
        position: absolute;
        left: 9999px;
      }
      
      .mainSwitch {
        display: block;
        width: 65px;
        height: 30px;
        margin: 28px 43px;
        position: relative;
        background: #ced8da;
        background: -moz-linear-gradient(left, #ced8da 0%, #d8e0e3 29%, #ccd4d7 34%, #d4dcdf 62%, #fff9f4 68%, #e1e9ec 74%, #b7bfc2 100%);
        background: -webkit-gradient(linear, left top, right top, color-stop(0%, #ced8da), color-stop(29%, #d8e0e3), color-stop(34%, #ccd4d7), color-stop(62%, #d4dcdf), color-stop(68%, #fff9f4), color-stop(74%, #e1e9ec), color-stop(100%, #b7bfc2));
        background: -webkit-linear-gradient(left, #ced8da 0%, #d8e0e3 29%, #ccd4d7 34%, #d4dcdf 62%, #fff9f4 68%, #e1e9ec 74%, #b7bfc2 100%);
        background: -o-linear-gradient(left, #ced8da 0%, #d8e0e3 29%, #ccd4d7 34%, #d4dcdf 62%, #fff9f4 68%, #e1e9ec 74%, #b7bfc2 100%);
        background: -ms-linear-gradient(left, #ced8da 0%, #d8e0e3 29%, #ccd4d7 34%, #d4dcdf 62%, #fff9f4 68%, #e1e9ec 74%, #b7bfc2 100%);
        background: linear-gradient(to right, #ced8da 0%, #d8e0e3 29%, #ccd4d7 34%, #d4dcdf 62%, #fff9f4 68%, #e1e9ec 74%, #b7bfc2 100%);
        filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#ced8da', endColorstr='#b7bfc2',GradientType=1 );
        transition: all 0.2s ease-out;
        cursor: pointer;
        border-radius: 0.35em;
        box-shadow: 0 0 1px 2px rgba(0, 0, 0, 0.7), inset 0 2px 0 rgba(255, 255, 255, 0.6), inset 0 -1px 0 1px rgba(0, 0, 0, 0.3), 0 8px 10px rgba(0, 0, 0, 0.15);
      }
      
      .mainSwitch:before {
        display: block;
        position: absolute;
        left: -35px;
        right: -35px;
        top: -25px;
        bottom: -25px;
        z-index: -2;
        content: "";
        border-radius: 0.4em;
        background: #d5dde0;
        background: linear-gradient(#d7dfe2, #bcc7cd);
        box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.6), inset 0 -1px 1px 1px rgba(0, 0, 0, 0.3), 0 0 8px 2px rgba(0, 0, 0, 0.2), 0 2px 4px 2px rgba(0, 0, 0, 0.1);
        pointer-events: none;
        transition: all 0.2s ease-out;
      }
      
      .mainSwitch:after {
        content: "";
        position: absolute;
        right: -25px;
        top: 50%;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #788b91;
        margin-top: -8px;
        z-index: -1;
        box-shadow: inset 0 -1px 8px rgba(0, 0, 0, 0.7), inset 0 -2px 2px rgba(0, 0, 0, 0.2), 0 1px 0 white, 0 -1px 0 rgba(0, 0, 0, 0.5), -47px 32px 15px 13px rgba(0, 0, 0, 0.25);
      }
      
      #mainSwitch:checked ~ .mainSwitch {
        background: #b7bfc2;
        background: -moz-linear-gradient(left, #b7bfc2 0%, #e1e9ec 26%, #fff9f4 32%, #d4dcdf 38%, #ccd4d7 66%, #d8e0e3 71%, #ced8da 100%);
        background: -webkit-gradient(linear, left top, right top, color-stop(0%, #b7bfc2), color-stop(26%, #e1e9ec), color-stop(32%, #fff9f4), color-stop(38%, #d4dcdf), color-stop(66%, #ccd4d7), color-stop(71%, #d8e0e3), color-stop(100%, #ced8da));
        background: -webkit-linear-gradient(left, #b7bfc2 0%, #e1e9ec 26%, #fff9f4 32%, #d4dcdf 38%, #ccd4d7 66%, #d8e0e3 71%, #ced8da 100%);
        background: -o-linear-gradient(left, #b7bfc2 0%, #e1e9ec 26%, #fff9f4 32%, #d4dcdf 38%, #ccd4d7 66%, #d8e0e3 71%, #ced8da 100%);
        background: -ms-linear-gradient(left, #b7bfc2 0%, #e1e9ec 26%, #fff9f4 32%, #d4dcdf 38%, #ccd4d7 66%, #d8e0e3 71%, #ced8da 100%);
        background: linear-gradient(to right, #b7bfc2 0%, #e1e9ec 26%, #fff9f4 32%, #d4dcdf 38%, #ccd4d7 66%, #d8e0e3 71%, #ced8da 100%);
        filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#b7bfc2', endColorstr='#ced8da',GradientType=1 );
      }
      
      #mainSwitch:checked ~ .mainSwitch:after {
        background: #b1ffff;
        box-shadow: inset 0 -1px 8px rgba(0, 0, 0, 0.7), inset 0 -2px 2px rgba(0, 0, 0, 0.2), 0 1px 0 white, 0 -1px 0 rgba(0, 0, 0, 0.5), -65px 25px 15px 13px rgba(0, 0, 0, 0.25);
      }
    </style>
  </div>
`.parseHTML();
