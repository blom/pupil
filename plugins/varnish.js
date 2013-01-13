var pupilPlugin = require('../lib/pupilplugin')
  , varnish     = new pupilPlugin()

/*
  TODO: varnish_threads.
*/
var varnishstat;
try {
  varnishstat = require('varnishstat');
} catch(err) {
  varnishstat = false;
  console.log('Module "varnishstat" failed to load.  Plugin disabled.');
}

varnish.prototype.test = function () {
  if ( varnishstat ) {
    return ['request_rate',
            'cache_hitrate',
            'backend_traffic',
            'objects',
            'transfer_rates',
            'memory_usage',
            'objects_per_objhead',
            'losthdr',
            'obj_sendfile_vs_write',
            'hcb',
            'esi',
            'objoverflow',
            'session',
            'session_herd',
            'shm_writes',
            'shm',
            'allocations',
            'purges',
            'expunge',
            'lru',
            'data_structures'];
  }
  else {
    return false;
  }
}

varnish.prototype.run = function () {
  var val = varnishstat.fetchStats();

  this.dispatch('cache_hitrate', {
    type: 'gauge',
    draw: 'stacked',
    data: {
      cache_hit    : (val.cache_hit     / val.client_req) * 100,
      cache_miss   : (val.cache_miss    / val.client_req) * 100,
      cache_hitpass: (val.cache_hitpass / val.client_req) * 100
    }
  });
  this.dispatch('request_rate', {
    type: 'counter',
    draw: 'line',
    data: {
      cache_hit         : val.cache_hit,
      cache_hitpass     : val.cache_hitpass,
      cache_miss        : val.cache_miss,
      backend_conn      : val.backend_conn,
      backend_unhealthy : val.backend_unhealthy,
      client_req        : val.client_req,
      client_conn       : val.client_conn,
      s_pipe            : val.s_pipe,
      s_pass            : val.s_pass
    }
  });
  this.dispatch('backend_traffic', {
    type: 'counter',
    draw: 'line',
    data: {
      backend_conn     : val.backend_conn,
      backend_unhealthy: val.backend_unhealthy,
      backend_busy     : val.backend_busy,
      backend_fail     : val.backend_fail,
      backend_reuse    : val.backend_reuse,
      backend_recycle  : val.backend_recycle,
      backend_unused   : val.backend_unused,
      backend_req      : val.backend_req
    }
  });
  this.dispatch('objects', {
    type: 'gauge',
    draw: 'line',
    data: {
      n_object     : val.n_object,
      n_objecthead : val.n_objecthead
    }
  });
  this.dispatch('transfer_rates', {
    type: 'counter',
    draw: 'line',
    data: {
      s_hdrbytes  : val.s_hdrbytes,
      s_bodybytes : val.s_bodybytes
    }
  });
  this.dispatch('memory_usage', {
    type: 'gauge',
    draw: 'line',
    data: {
      sm_balloc : val.sm_balloc,
      sma_nbytes: val.sma_nbytes,
      sms_nbytes: val.sms_nbytes
    }
  });
  this.dispatch('objects_per_objhead', {
    type: 'counter',
    draw: 'line',
    data: {
      obj_per_objhead : val.n_object / val.n_objecthead
    }
  });
  this.dispatch('losthdr', {
    type: 'counter',
    draw: 'line',
    data: {
      losthdr : val.losthdr
    }
  });
  this.dispatch('obj_sendfile_vs_write', {
    type: 'counter',
    draw: 'line',
    data: {
      n_objsendfile : val.n_objsendfile,
      n_objwrite    : val.n_objwrite
    }
  });
  this.dispatch('hcb', {
    type: 'counter',
    draw: 'line',
    data: {
      hcb_nolock : val.hcb_nolock,
      hcb_lock   : val.hcb_lock,
      hcb_insert : val.hcb_insert
    }
  });
  this.dispatch('esi', {
    type: 'counter',
    draw: 'line',
    data: {
      esi_parse  : val.esi_parse,
      esi_errors : val.esi_errors
    }
  });
  this.dispatch('objoverflow', {
    type: 'counter',
    draw: 'line',
    data: {
      n_objoverflow  : val.n_objoverflow
    }
  });
  this.dispatch('session', {
    type: 'counter',
    draw: 'line',
    data: {
      sess_closed   : val.sess_closed,
      sess_pipeline : val.sess_pipeline,
      sess_readahead: val.sess_readahead,
      sess_linger   : val.sess_linger
    }
  });
  this.dispatch('session_herd', {
    type: 'counter',
    draw: 'line',
    data: {
      sess_herd   : val.sess_herd
    }
  });
  this.dispatch('shm_writes', {
    type: 'counter',
    draw: 'line',
    data: {
      shm_records   : val.shm_records,
      shm_writes    : val.shm_writes
    }
  });
  this.dispatch('shm', {
    type: 'counter',
    draw: 'line',
    data: {
      shm_flushes : val.shm_flushes,
      shm_cont    : val.shm_cont,
      shm_cycles  : val.shm_cycles
    }
  });
  this.dispatch('allocations', {
    type: 'counter',
    draw: 'line',
    data: {
      sm_nreq  : val.sm_nreq,
      sma_nreq : val.sma_nreq,
      sms_nreq : val.sms_nreq
    }
  });
  this.dispatch('purges', {
    type: 'counter',
    draw: 'line',
    data: {
      n_ban_add      : val.n_ban_add,
      n_ban_this.dispatchire   : val.n_ban_this.dispatchire,
      n_ban_obj_test : val.n_ban_obj_test,
      n_ban_re_test  : val.n_ban_re_test,
      n_ban_dups     : val.n_ban_dups
    }
  });
  this.dispatch('expunge', {
    type: 'counter',
    draw: 'line',
    data: {
      n_expired   : val.n_expired,
      n_lru_nuked : val.n_lru_nuked
    }
  });
  this.dispatch('lru', {
    type: 'counter',
    draw: 'line',
    data: {
      n_lru_saved : val.n_lru_saved,
      n_lru_moved : val.n_lru_moved
    }
  });
  this.dispatch('data_structures', {
    type: 'gauge',
    draw: 'line',
    data: {
      n_srcaddr      : val.n_srcaddr,
      n_srcaddr_acct : val.n_srcaddr_acct,
      n_sess_mem     : val.n_sess_mem,
      n_sess         : val.n_sess,
      n_smf          : val.n_smf,
      n_smf_frag     : val.n_smf_frag,
      n_smf_large    : val.n_smf_large,
      n_vbe_conn     : val.n_vbe_conn,
      n_bereq        : val.n_bereq
    }
  });

}

module.exports = varnish;
