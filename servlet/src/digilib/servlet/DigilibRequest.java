/*
 * DigilibRequest.java
 *
 * lightweight class carrying all parameters for a request to digilib
 *

  Digital Image Library servlet components

  Copyright (C) 2001, 2002 Robert Casties (robcast@mail.berlios.de),
                           Christian Luginbuehl

  This program is free software; you can redistribute  it and/or modify it
  under  the terms of  the GNU General  Public License as published by the
  Free Software Foundation;  either version 2 of the  License, or (at your
  option) any later version.
   
  Please read license.txt for the full details. A copy of the GPL
  may be found at http://www.gnu.org/copyleft/lgpl.html

  You should have received a copy of the GNU General Public License
  along with this program; if not, write to the Free Software
  Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA

 * Created on 27. August 2002, 19:43
 */

package digilib.servlet;

/**
 *
 * @author  casties
 */

import java.util.*;

public class DigilibRequest {

    private String request_path;    // url of the page/document
    private String fn;              // url of the page/document
    private int pn;                 // page number
    private String pn_s;
    private int dw;                 // width of client in pixels
    private String dw_s;
    private int dh;                 // height of client in pixels
    private String dh_s;
    private float wx;               // left edge of image (float from 0 to 1)
    private String wx_s;
    private float wy;               // top edge in image (float from 0 to 1)
    private String wy_s;
    private float ww;               // width of image (float from 0 to 1)
    private String ww_s;
    private float wh;               // height of image (float from 0 to 1)
    private String wh_s; 
    private float ws;               // scale factor
    private String ws_s;
    private String mo;              // special options like 'fit' for gifs
    private String mk;              // marks    
    private int pt;                 // total number of pages (generated by sevlet)
    private String pt_s;
    private String baseURL;         // base URL (from http:// to below /servlet)
    
    /** Creates a new instance of DigilibRequest */
    public DigilibRequest() {
    }

    /** Populate a request from a string in the old "++++" parameter form.
     *
     * @param queryString String with paramters in the old "+++" form.
     */    
    public void setWithOldString(String queryString) {
        
        resetRequest(); // clear all first
        if (queryString == null) {
            return;
        }
        
	// enable the passing of delimiter to get empty parameters
	StringTokenizer query = new StringTokenizer(queryString, "+", true);
        String token;

	if (query.hasMoreTokens()) {
            token = query.nextToken();
            if (! token.equals("+")) {
		fn = token;
                request_path = null;
                if (query.hasMoreTokens()) {
                    query.nextToken();
                }
            }
	}
	if (query.hasMoreTokens()) {
            token = query.nextToken();
            if (! token.equals("+")) {
                try {
                    int i = Integer.parseInt(token);
                    pn = i;
                    pn_s = token;
                } catch(Exception e) {
                //util.dprintln(4, "trytoGetParam(int) failed on param "+s);
                }
                if (query.hasMoreTokens()) {
                    query.nextToken();
                }
            }
	}
	if (query.hasMoreTokens()) {
            token = query.nextToken();
            if (! token.equals("+")) {
                try {
                    float f = Float.parseFloat(token);
                    ws = f;
                    ws_s = token;
                } catch(Exception e) {
                //util.dprintln(4, "trytoGetParam(int) failed on param "+s);
                }
                if (query.hasMoreTokens()) {
                    query.nextToken();
                }
            }
	}
	if (query.hasMoreTokens()) {
            token = query.nextToken();
            if (! token.equals("+")) {
                mo = token;
            }
	}
	if (query.hasMoreTokens()) {
            token = query.nextToken();
            if (! token.equals("+")) {
                mk = token;
                if (query.hasMoreTokens()) {
                    query.nextToken();
                }
            }
	}
	if (query.hasMoreTokens()) {
            token = query.nextToken();
            if (! token.equals("+")) {
                try {
                    float f = Float.parseFloat(token);
                    wx = f;
                    wx_s = token;
                } catch(Exception e) {
                //util.dprintln(4, "trytoGetParam(int) failed on param "+s);
                }
                if (query.hasMoreTokens()) {
                    query.nextToken();
                }
            }
	}
	if (query.hasMoreTokens()) {
            token = query.nextToken();
            if (! token.equals("+")) {
                try {
                    float f = Float.parseFloat(token);
                    wy = f;
                    wy_s = token;
                } catch(Exception e) {
                //util.dprintln(4, "trytoGetParam(int) failed on param "+s);
                }
                if (query.hasMoreTokens()) {
                    query.nextToken();
                }
            }
	}
	if (query.hasMoreTokens()) {
            token = query.nextToken();
            if (! token.equals("+")) {
                try {
                    float f = Float.parseFloat(token);
                    ww = f;
                    ww_s = token;
                } catch(Exception e) {
                //util.dprintln(4, "trytoGetParam(int) failed on param "+s);
                }
                if (query.hasMoreTokens()) {
                    query.nextToken();
                }
            }
	}
	if (query.hasMoreTokens()) {
            token = query.nextToken();
            if (! token.equals("+")) {
                try {
                    float f = Float.parseFloat(token);
                    wh = f;
                    wh_s = token;
                } catch(Exception e) {
                //util.dprintln(4, "trytoGetParam(int) failed on param "+s);
                }
                if (query.hasMoreTokens()) {
                    query.nextToken();
                }
            }
	}
    }   
    
    /** Returns the request parameters as a String in the parameter form
     * 'fn=/icons&amp;pn=1'. Empty (undefined) fields are not included.
     *
     * @return String of request paramters in parameter form.
     */    
    public String getAsString() {
        String s = "";
        if (request_path != null) {
            s += request_path + "?";
        }
        if (fn != null) {
            s += "fn=" + fn;
        }
        if (pn_s != null) {
            s += "&pn=" + pn_s;
        }
        if (dw_s != null) {
            s += "&dw=" + dw_s;
        }
        if (dh_s != null) {
            s += "&dh=" + dh_s;
        }
        if (wx_s != null) {
            s += "&wx=" + wx_s;
        }
        if (wy_s != null) {
            s += "&wy=" + wy_s;
        }
        if (ww_s != null) {
            s += "&ww=" + ww_s;
        }
        if (wh_s != null) {
            s += "&wh=" + wh_s;
        }
        if (ws_s != null) {
            s += "&ws=" + ws_s;
        }
        if (mo != null) {
            s += "&mo=" + mo;
        }
        if (mk != null) {
            s += "&mk=" + mk;
        }
        if (pt_s != null) {
            s += "&pt=" + pt_s;
        }
        return s;
    }
    
    /** Returns request parameters in old '++++' form.
     *
     * @return String with parameters in old '++++' form.
     */    
    public String getAsOldString() {
        String s = "";
        s += (request_path != null) ? request_path : "";
        s += (fn != null) ? fn : "";
        s += "+" + ((pn_s != null) ? pn_s : "");
        s += "+" + ((ws_s != null) ? ws_s : "");
        s += "+" + ((mo != null) ? mo : "");
        s += "+" + ((mk != null) ? mk : "");
        s += "+" + ((wx_s != null) ? wx_s : "");
        s += "+" + ((wy_s != null) ? wy_s : "");
        s += "+" + ((ww_s != null) ? ww_s : "");
        s += "+" + ((wh_s != null) ? wh_s : "");
        return s;
    }
    
    /** Set request parameters from javax.servlet.ServletRequest. Uses the Requests
     * getParameter methods for 'fn=foo' style parameters.
     *
     * @param request ServletRequest to get parameters from.
     */    
    public void setWithRequest(javax.servlet.ServletRequest request) {
        String s;
        s = request.getParameter("fn");
        if (s != null) {
            setFn(s);
        }
        s = request.getParameter("pn");
        if (s != null) {
            setPn(s);
        }
        s = request.getParameter("ws");
        if (s != null) {
            setWs(s);
        }
        s = request.getParameter("mo");
        if (s != null) {
            setMo(s);
        }
        s = request.getParameter("mk");
        if (s != null) {
            setMk(s);
        }
        s = request.getParameter("wx");
        if (s != null) {
            setWx(s);
        }
        s = request.getParameter("wy");
        if (s != null) {
            setWy(s);
        }
        s = request.getParameter("ww");
        if (s != null) {
            setWw(s);
        }
        s = request.getParameter("wh");
        if (s != null) {
            setWh(s);
        }
        s = request.getParameter("dw");
        if (s != null) {
            setDw(s);
        }
        s = request.getParameter("dh");
        if (s != null) {
            setDh(s);
        }
        s = request.getParameter("pt");
        if (s != null) {
            setPt(s);
        }
        setBaseURL((javax.servlet.http.HttpServletRequest)request);
    }

    
    /** Reset all request parameters to null. */    
    public void resetRequest() {
        request_path = null;    // url of the page/document
        fn = null;              // url of the page/document
        pn = 0;                 // page number
        pn_s = null;
        dw = 0;                 // width of client in pixels
        dw_s = null;
        dh = 0;                 // height of client in pixels
        dh_s = null;
        wx = 0f;               // left edge of image (float from 0 to 1)
        wx_s = null;
        wy = 0f;               // top edge in image (float from 0 to 1)
        wy_s = null;
        ww = 0f;               // width of image (float from 0 to 1)
        ww_s = null;
        wh = 0f;               // height of image (float from 0 to 1)
        wh_s = null;
        ws = 0f;               // scale factor
        ws_s = null;
        mo = null;              // special options like 'fit' for gifs
        mk = null;              // marks
        pt = 0;                 // total number of pages
        pt_s = null;
        baseURL = null;
    }
    
    /* Default getter and setter */
    
    /** Getter for property dh.
     * @return Value of property dh.
     *
     */
    public int getDh() {
        return dh;
    }
    
    /** Setter for property dh.
     * @param dh New value of property dh.
     *
     */
    public void setDh(int dh) {
        this.dh = dh;
        dh_s = Integer.toString(dh);
    }
    public void setDh(String dh) {
        try {
            int i = Integer.parseInt(dh);
            this.dh = i;
            this.dh_s = dh;
        } catch(Exception e) {
            //util.dprintln(4, "trytoGetParam(int) failed on param "+s);
        }
    }
    
    /** Getter for property dw.
     * @return Value of property dw.
     *
     */
    public int getDw() {
        return dw;
    }
    
    /** Setter for property dw.
     * @param dw New value of property dw.
     *
     */
    public void setDw(int dw) {
        this.dw = dw;
        dw_s = Integer.toString(dw);
    }
    public void setDw(String dw) {
        try {
            int i = Integer.parseInt(dw);
            this.dw = i;
            this.dw_s = dw;
        } catch(Exception e) {
            //util.dprintln(4, "trytoGetParam(int) failed on param "+s);
        }
    }
    
    /** Getter for property fn.
     * @return Value of property fn.
     *
     */
    public java.lang.String getFn() {
        return fn;
    }
    
    /** Setter for property fn.
     * @param fn New value of property fn.
     *
     */
    public void setFn(java.lang.String fn) {
        this.fn = fn;
    }
    
    /** Getter for property mo.
     * @return Value of property mo.
     *
     */
    public java.lang.String getMo() {
        return mo;
    }
    
    /** Setter for property mo.
     * @param mo New value of property mo.
     *
     */
    public void setMo(java.lang.String mo) {
        this.mo = mo;
    }
    
    /** Getter for property pn.
     * @return Value of property pn.
     *
     */
    public int getPn() {
        return pn;
    }
    
    /** Setter for property pn.
     * @param pn New value of property pn.
     *
     */
    public void setPn(int pn) {
        this.pn = pn;
        pn_s = Integer.toString(pn);
    }
    public void setPn(String pn) {
        try {
            int i = Integer.parseInt(pn);
            this.pn = i;
            this.pn_s = pn;
        } catch(Exception e) {
            //util.dprintln(4, "trytoGetParam(int) failed on param "+s);
        }
    }
    
    /** Getter for property request_path.
     * @return Value of property request_path.
     *
     */
    public java.lang.String getRequest_path() {
        return request_path;
    }
    
    /** Setter for property request_path.
     * @param request_path New value of property request_path.
     *
     */
    public void setRequest_path(java.lang.String request_path) {
        this.request_path = request_path;
    }
    
    /** Getter for property wh.
     * @return Value of property wh.
     *
     */
    public float getWh() {
        return wh;
    }
    
    /** Setter for property wh.
     * @param wh New value of property wh.
     *
     */
    public void setWh(float wh) {
        this.wh = wh;
        wh_s = Float.toString(wh);
    }
    public void setWh(String wh) {
        try {
            float f = Float.parseFloat(wh);
            this.wh = f;
            this.wh_s = wh;
        } catch(Exception e) {
            //util.dprintln(4, "trytoGetParam(int) failed on param "+s);
        }
    }
    
    /** Getter for property ws.
     * @return Value of property ws.
     *
     */
    public float getWs() {
        return ws;
    }
    
    /** Setter for property ws.
     * @param ws New value of property ws.
     *
     */
    public void setWs(float ws) {
        this.ws = ws;
        ws_s = Float.toString(ws);
    }
    public void setWs(String ws) {
        try {
            float f = Float.parseFloat(ws);
            this.ws = f;
            this.ws_s = ws;
        } catch(Exception e) {
            //util.dprintln(4, "trytoGetParam(int) failed on param "+s);
        }
    }
    
    /** Getter for property ww.
     * @return Value of property ww.
     *
     */
    public float getWw() {
        return ww;
    }
    
    /** Setter for property ww.
     * @param ww New value of property ww.
     *
     */
    public void setWw(float ww) {
        this.ww = ww;
        ww_s = Float.toString(ww);
    }
    public void setWw(String ww) {
        try {
            float f = Float.parseFloat(ww);
            this.ww = f;
            this.ww_s = ww;
        } catch(Exception e) {
            //util.dprintln(4, "trytoGetParam(int) failed on param "+s);
        }
    }
    
    /** Getter for property wx.
     * @return Value of property wx.
     *
     */
    public float getWx() {
        return wx;
    }
    
    /** Setter for property wx.
     * @param wx New value of property wx.
     *
     */
    public void setWx(float wx) {
        this.wx = wx;
        wx_s = Float.toString(wx);
    }
    public void setWx(String wx) {
        try {
            float f = Float.parseFloat(wx);
            this.wx = f;
            this.wx_s = wx;
        } catch(Exception e) {
            //util.dprintln(4, "trytoGetParam(int) failed on param "+s);
        }
    }
    
    /** Getter for property wy.
     * @return Value of property wy.
     *
     */
    public float getWy() {
        return wy;
    }
    
    /** Setter for property wy.
     * @param wy New value of property wy.
     *
     */
    public void setWy(float wy) {
        this.wy = wy;
        wy_s = Float.toString(wy);
    }
    public void setWy(String wy) {
        try {
            float f = Float.parseFloat(wy);
            this.wy = f;
            this.wy_s = wy;
        } catch(Exception e) {
            //util.dprintln(4, "trytoGetParam(int) failed on param "+s);
        }
    }
    
    /** Getter for property mk.
     * @return Value of property mk.
     *
     */
    public java.lang.String getMk() {
        return mk;
    }
    
    /** Setter for property mk.
     * @param mk New value of property mk.
     *
     */
    public void setMk(java.lang.String mk) {
        this.mk = mk;
    }
    
    /** Getter for property pt.
     * @return Value of property pt.
     *
     */
    public int getPt() {
        return pt;
    }
    
    /** Setter for property pt.
     * @param pt New value of property pt.
     *
     */
    public void setPt(int pt) {
        this.pt = pt;
        pt_s = Integer.toString(pt);
    }
    public void setPt(String pt) {
        try {
            int i = Integer.parseInt(pt);
            this.pt = i;
            this.pt_s = pt;
        } catch(Exception e) {
            //util.dprintln(4, "trytoGetParam(int) failed on param "+s);
        }
    }
    
    /** Returns the base URL (from http:// up to the base directory without file name or
     * /servlet). Base URL has to be set from a request via setBaseURL or
     * setWithRequest.
     * @return String with the base URL.
     */    
    public String getBaseURL() {
        return baseURL;
    }
    
    /** Set the requests base URL parameter from a javax.sevlet.http.HttpServletRequest.
     * @param request HttpServletRequest to set the base URL.
     */    
    public void setBaseURL(javax.servlet.http.HttpServletRequest request) {
        // calculate base URL string from request (minus last part)
        String s = request.getRequestURL().toString();
        int eop = s.lastIndexOf("/");
        if (eop > 0) {
            baseURL = s.substring(0, eop);
        } else {
            // fall back
            baseURL = "http://" + request.getServerName() + "/docuserver/digitallibrary";
        }
    }

    
}
