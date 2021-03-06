package digilib.servlet;

/*
 * #%L
 * 
 * DocumentBean -- Access control bean for JSP
 *
 * Digital Image Library servlet components
 * 
 * %%
 * Copyright (C) 2001 - 2016 MPIWG Berlin
 * %%
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as 
 * published by the Free Software Foundation, either version 3 of the 
 * License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Lesser Public License for more details.
 * 
 * You should have received a copy of the GNU General Lesser Public 
 * License along with this program.  If not, see
 * <http://www.gnu.org/licenses/lgpl-3.0.html>.
 * #L%
 * Author: Robert Casties (robcast@berlios.de)
 */

import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

import digilib.auth.AuthOpException;
import digilib.auth.AuthzOps;
import digilib.conf.DigilibServletConfiguration;
import digilib.conf.DigilibServletRequest;
import digilib.io.DocuDirCache;
import digilib.io.DocuDirectory;
import digilib.io.FileOps.FileClass;
import digilib.io.ImageInput;
import digilib.io.ImageSet;
import digilib.util.ImageSize;

/**
 * Java bean providing access to digilib configuration and functionality for JSPs.
 * 
 * @author robcast
 *
 * @deprecated use {@link digilib.servlet.DigilibBean} instead.
 */
public class DocumentBean {

	// general logger
	private static Logger logger = Logger.getLogger("digilib.docubean");

	// AuthOps object to check authorization
	private AuthzOps authzOp;

	// use authorization database
	private boolean useAuthorization = true;

	// path to add for authenticated access
	private String authURLPath = "";

	// DocuDirCache
	private DocuDirCache dirCache = null;

	// DigilibConfiguration object
	private DigilibServletConfiguration dlConfig;

	// DigilibRequest object
	private DigilibServletRequest dlRequest = null;

	/**
	 * Constructor for DocumentBean.
	 */
	public DocumentBean() {
        logger.debug("new DocumentBean");
	}

	public DocumentBean(ServletConfig conf) {
        logger.debug("new DocumentBean");
		try {
			setConfig(conf);
		} catch (Exception e) {
			logger.fatal("ERROR: Unable to read config: ", e);
		}
	}

	public void setConfig(ServletConfig conf) throws ServletException {
		logger.debug("setConfig");
		// get our ServletContext
		ServletContext context = conf.getServletContext();
		// see if there is a Configuration instance
		dlConfig = DigilibServletConfiguration.getCurrentConfig(context);
		if (dlConfig == null) {
			// no config
			throw new ServletException("ERROR: No digilib configuration for DocumentBean!");
		}

		// get cache
		dirCache = (DocuDirCache) dlConfig.getValue(DigilibServletConfiguration.DIR_CACHE_KEY);

		/*
		 * authentication
		 */
		useAuthorization = dlConfig.getAsBoolean("use-authorization");
		authzOp = (AuthzOps) dlConfig.getValue("servlet.authz.op");
		authURLPath = dlConfig.getAsString("auth-url-path");
		if (useAuthorization && (authzOp == null)) {
			throw new ServletException(
					"ERROR: use-authorization configured but no AuthOp!");
		}
	}

	/**
	 * check if the request must be authorized to access filepath
	 */
	public boolean isAuthRequired(DigilibServletRequest request)
			throws AuthOpException {
		logger.debug("isAuthRequired");
		return useAuthorization ? authzOp.isAuthorizationRequired(request) : false;
	}

	/**
	 * check if the request is allowed to access filepath
	 */
	public boolean isAuthorized(DigilibServletRequest request) throws AuthOpException {
		logger.debug("isAuthorized");
		return useAuthorization ? authzOp.isAuthorized(request) : true;
	}

	/**
	 * check for authenticated access and redirect if necessary
	 */
	public boolean doAuthentication(HttpServletResponse response)
			throws Exception {
        logger.debug("doAuthenication-Method");
		return doAuthentication(dlRequest, response);
	}

	/**
	 * check for authenticated access and redirect if necessary
	 */
	public boolean doAuthentication(DigilibServletRequest request,
			HttpServletResponse response) throws Exception {
		logger.debug("doAuthentication");
		if (!useAuthorization) {
			// shortcut if no authorization
			return true;
		}
		// quick fix: add auth-url-path to base.url
        if (isAuthRequired(request)) {
            String baseUrl = request.getAsString("base.url");
            if (!baseUrl.endsWith(authURLPath)) {
                request.setValue("base.url", baseUrl + "/" + authURLPath);
            }
        }
		// check if we are already authenticated
		if (((HttpServletRequest) request.getServletRequest()).getRemoteUser() == null) {
			logger.debug("unauthenticated so far");
			// if not maybe we must?
			if (isAuthRequired(request)) {
				logger.debug("auth required, redirect");
				// we are not yet authenticated -> redirect
				response.sendRedirect(request.getAsString("base.url")
						+ ((HttpServletRequest) request.getServletRequest())
								.getServletPath()
						+ "?"
						+ ((HttpServletRequest) request.getServletRequest())
								.getQueryString());
			}
		}
		return true;
	}

	/**
	 * Sets the current DigilibRequest. Also completes information in the request.
	 * 
	 * @param dlRequest
	 *            The dlRequest to set.
	 */
	public void setRequest(DigilibServletRequest dlRequest) throws Exception {
		this.dlRequest = dlRequest;
		if (dirCache == null) {
			return;
		}
		String fn = dlRequest.getFilePath();
		// get information about the file
		ImageSet fileset = (ImageSet) dirCache.getFile(fn, dlRequest.getAsInt("pn"));
		if (fileset == null) {
			return;
		}
		// add file name
		dlRequest.setValue("img.fn", fileset);
		// add dpi
		dlRequest.setValue("img.dpix", new Double(fileset.getResX()));
		dlRequest.setValue("img.dpiy", new Double(fileset.getResY()));
		// get number of pages in directory
		DocuDirectory dd = dirCache.getDirectory(fn);
		if (dd != null) {
			// add pt
			dlRequest.setValue("pt", dd.size());
		}
		// get original pixel size
		ImageInput origfile = fileset.getBiggest();
		// check image for size (TODO: just if mo=hires?)
		ImageSize pixsize = origfile.getSize();
		if (pixsize != null) {
			// add pixel size
			dlRequest.setValue("img.pix_x", new Integer(pixsize.getWidth()));
			dlRequest.setValue("img.pix_y", new Integer(pixsize.getHeight()));
		}
	}

	/**
	 * get the first page number in the directory (not yet functional)
	 */
	public int getFirstPage(DigilibServletRequest request) {
		logger.debug("getFirstPage");
		return 1;
	}

	/**
	 * get the number of pages/files in the directory
	 */
	public int getNumPages() throws Exception {
		return getNumPages(dlRequest);
	}

    /**
     * get the number of image pages/files in the directory
     */
    public int getNumPages(DigilibServletRequest request) throws Exception {
        logger.debug("getNumPages");
        DocuDirectory dd = (dirCache != null) ? dirCache.getDirectory(request
                .getFilePath()) : null;
        if (dd != null) {
            return dd.size();
        }
        return 0;
    }

	/**
	 * Returns the dlConfig.
	 * 
	 * @return DigilibConfiguration
	 */
	public DigilibServletConfiguration getDlConfig() {
		return dlConfig;
	}

    /**
     * @return Returns the dlRequest.
     */
    public DigilibServletRequest getRequest() {
        return dlRequest;
    }

    /**
     * get the number of pages/files of type fc in the directory
     * 
     * @deprecated use {@link #getNumPages(DigilibServletRequest request)} instead
     */
    public int getNumPages(DigilibServletRequest request, FileClass fc) throws Exception {
        return getNumPages(request);
    }

	/**
	 * returns if the zoom area in the request can be moved
	 * 
	 * @return
	 * 
	 * only used by oldskin JSP
	 */
	public boolean canMoveRight() {
		float ww = dlRequest.getAsFloat("ww");
		float wx = dlRequest.getAsFloat("wx");
		return (ww + wx < 1.0);
	}

	/**
	 * returns if the zoom area in the request can be moved
	 * 
	 * @return
     * 
     * only used by oldskin JSP
	 */
	public boolean canMoveLeft() {
		float ww = dlRequest.getAsFloat("ww");
		float wx = dlRequest.getAsFloat("wx");
		return ((ww < 1.0) && (wx > 0));
	}

	/**
	 * returns if the zoom area in the request can be moved
	 * 
	 * @return
     * 
     * only used by oldskin JSP
	 */
	public boolean canMoveUp() {
		float wh = dlRequest.getAsFloat("wh");
		float wy = dlRequest.getAsFloat("wy");
		return ((wh < 1.0) && (wy > 0));
	}

	/**
	 * returns if the zoom area in the request can be moved
	 * 
	 * @return
     * 
     * only used by oldskin JSP
	 */
	public boolean canMoveDown() {
		float wh = dlRequest.getAsFloat("wh");
		float wy = dlRequest.getAsFloat("wy");
		return (wh + wy < 1.0);
	}

}
