// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

/* global window */

import Vue from 'vue'
import VueResource from 'vue-resource'
import App from './App'
import router from './router'
import Highlight from 'highlightjs'
import 'highlightjs/styles/atom-one-dark.css'
import Moment from 'moment'
import VueAnalytics from 'vue-analytics'

Vue.config.productionTip = false

Vue.use(VueResource)
if (window.document.location.hostname === 'pdfshift.io') {
    Vue.http.options.root = 'https://api.pdfshift.io/v2/'
    window.stripe_instance = window.Stripe('pk_live_Nu7cMuvIDlk7gHcksvN52v5S')
} else {
    Vue.http.options.root = 'http://127.0.0.1:5000/v2/'
    window.stripe_instance = window.Stripe('pk_test_N1Lori9EgMNMzWplqBUHcVlB')
}

Vue.use(VueAnalytics, {id: 'UA-17593304-8', router})

Vue.directive('hljs', {
    inserted: function (el) {
        Highlight.highlightBlock(el)
    }
})

function getQueryVariable (variable) {
    var query = window.location.search.substring(1)
    var vars = query.split('&')
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=')
        if (decodeURIComponent(pair[0]) === variable) {
            return decodeURIComponent(pair[1])
        }
    }
    return null
}

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    components: { App },
    template: '<App/>',
    data () {
        return {
            campaign: null
        }
    },
    created: function () {
        try {
            try {
                this.campaign = localStorage.getItem('campaign')
            } catch (e) {}

            if (this.campaign === null) {
                try {
                    this.campaign = sessionStorage.getItem('campaign')
                } catch (e) {}
            }

            if (this.campaign === null) {
                this.campaign = {}

                if (document.referrer !== '') {
                    this.campaign['referrer'] = document.referrer
                }

                let val = getQueryVariable('ref')
                if (val !== null) {
                    this.campaign['source'] = val
                }

                for (let k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term']) {
                    let val = getQueryVariable(k)
                    if (val !== null) {
                        if (!('utm' in this.campaign)) {
                            this.campaign['utm'] = {}
                        }
                        this.campaign['utm'][k.replace('utm', '')] = val
                    }
                }

                if ('utm' in this.campaign) {
                    if (!('source' in this.campaign) && 'utm_source' in this.campaign['utm']) {
                        this.campaign['source'] = this.campaign['utm']['utm_source']
                    }

                    this.campaign['utm'] = JSON.stringify(this.campaign['utm'])
                }

                this.campaign = JSON.stringify(this.campaign)

                try {
                    localStorage.setItem('campaign', this.campaign)
                } catch (e) {
                    try {
                        sessionStorage.setItem('campaign', this.campaign)
                    } catch (e) {}
                }
            }
        } catch (e) {
            console.error(e)
        }
    }
})

Vue.filter('datetime', (date) => {
    return Moment.utc(date).format('DD/MM/YYYY')
})
