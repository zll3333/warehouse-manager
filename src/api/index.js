/**
 * api管理
 */
import request from '../utils/request'

export default {
  /**
   * 用户管理
   */
  //登录
  login (params) {
    return request.post('/users/login', params, { mock: false })
  },
  noticeCount (params) {
    return request.get('/leave/count')
  },
  getUserInfo (params) {
    return request.get('/users/userInfo', params)
  },
  // 获取用户列表
  getUserList (params) {
    return request.get('/users/list', params)
  },
  // 删除用户
  deleteUser (params) {
    return request.post('/users/delete', params)
  },
  // 创建用户/用户提交
  userSubmit (params) {
    return request.post('/users/operate', params)
  },
  // 获取所有用户
  getUserAllList () {
    return request.get('/users/allList')
  },
  // 获取审批人
  getApproverList () {
    return request.get('/users/approverList')
  },
  // 用户权限列表
  getPermissionList () {
    return request.get('/users/getPermissionList')
  },
  updatePwd (params) {
    return request.post('/users/updatePwd', params)
  },
  updateUser (params) {
    return request.post('/users/updateUser', params)
  },
  /**
   * 菜单管理
   */
  // 获取菜单列表
  getMenuList (params) {
    return request.get('/menu/list', params)
  },
  // 创建菜单/菜单提交
  menuSubmit (params) {
    return request.post('/menu/operate', params)
  },

  /**
   * 角色管理
   */
  getRoleList (params) {
    return request.get('/roles/list', params)
  },
  // 获取所有角色
  getRoleAllList () {
    return request.get('/roles/allList')
  },
  // 操作角色  创建/删除/修改
  roleSubmit (params) {
    return request.post('/roles/operate', params)
  },
  // 权限列表
  updatePermission (params) {
    return request.post('/roles/update/permission', params)
  },
  /**
   * 部门管理
   */
  getDeptList (params) {
    return request.get('/dept/list', params)
  },
  // 获取所有部门
  getDeptAllList () {
    return request.get('/dept/allList')
  },
  deptSubmit (params) {
    return request.post('/dept/operate', params)
  },
  /**
   * 供应商管理
   */
  getVendorList (params) {
    return request.get('/vendor/list', params)
  },
  vendorSubmit (params) {
    return request.post('/vendor/operate', params)
  },
  /**
   * 物资管理
   */
  getMaterialList (params) {
    return request.get('/material/list', params)
  },
  getAllMaterialList (params) {
    return request.get('/material/allList', params)
  },
  materialSubmit (params) {
    return request.post('/material/operate', params)
  },
  // 删除物资
  deleteMaterial (params) {
    return request.post('/material/delete', params)
  },
  /**
   * 仓库管理
   */
  getWarehouseList (params) {
    return request.get('/warehouse/list', params)
  },
  getWarehouseAllList () {
    return request.get('/warehouse/allList')
  },
  warehouseSubmit (params) {
    return request.post('/warehouse/operate', params)
  },
  /**
   * 入库申请管理
   */
  getInboundReqList (params) {
    return request.get('/inbound/reqList', params)
  },
  getInboundApproveList (params) {
    return request.get('/inbound/approveList', params)
  },
  getInboundRecordList (params) {
    return request.get('/inbound/recordList', params)
  },
  inboundReqSubmit (params) {
    return request.post('/inbound/reqOperate', params)
  },
  inboundSubmit (params) {
    return request.post('/inbound/operate', params)
  },
  /**
   * 出库管理
   */
  getOutboundReqList (params) {
    return request.get('/outbound/reqList', params)
  },
  getOutboundApproveList (params) {
    return request.get('/outbound/approveList', params)
  },

  getOutboundRecordList (params) {
    return request.get('/outbound/recordList', params)
  },
  outboundReqSubmit (params) {
    return request.post('/outbound/reqOperate', params)
  },
  outboundSubmit (params) {
    return request.post('/outbound/operate', params)
  },

  /**
   * 库存管理
   */
  getStackList (params) {
    return request.get('/stack/list', params)
  },
  getStackAllList (params) {
    return request.get('/stack/allList', params)
  },
  stackSubmit (params) {
    return request.post('/stack/operate', params)
  },
  getAlertList (params) {
    return request.get('/stack/alertList', params)
  },
  getData () {
    return request.get('/stack/data')
  },

  /**
   * 数据管理
   */
  getMyundoData (params) {
    return request.get('/data/myundo', params)
  },
  getMydoneData (params) {
    return request.get('/data/mydone', params)
  },
  getInboundBarData () {
    return request.get('/data/inboundbar')
  },
  getOutboundBarData () {
    return request.get('/data/outboundbar')
  },
  getInboundPieData () {
    return request.get('/data/inboundpie')
  },
  getOutboundPieData () {
    return request.get('/data/outboundpie')
  },
  getWarehouseStack () {
    return request.get('/data/warehouse')
  },
  getProductType () {
    return request.get('data/product')
  },
  getMaterialBoundNum () {
    return request.get('data/materialBound')
  },
  /**
   * 库存报表
   */
  // 获取库存数据
  getStackData () {
    return request.get('/data/stackData')
  },
  getStack () {
    return request.get("/data/stackNum")
  }
}